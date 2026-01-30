import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../../entities';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { SepayWebhookDto } from './dto/sepay-webhook.dto';
import * as crypto from 'crypto';

// In-memory storage for pending payments (in production, use Redis or database)
interface PendingPayment {
  studentId: number;
  amount: number;
  transactionCode: string;
  createdAt: Date;
  expiresAt: Date;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private pendingPayments: Map<string, PendingPayment> = new Map();
  // Track processed transactions to prevent duplicates (SePay recommendation)
  private processedTransactions: Set<string> = new Set();

  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
  ) {}

  /**
   * Create a pending payment session for a student
   */
  async createPendingPayment(studentId: number): Promise<{ 
    transactionCode: string; 
    amount: number;
    expiresIn: number;
  }> {
    // Generate unique transaction code: LINGRISER + studentId + timestamp
    const timestamp = Date.now().toString(36).toUpperCase();
    const transactionCode = `LR${studentId}${timestamp}`;
    
    const amount = 2990000; // 2,990,000 VND
    const expiresIn = 300; // 5 minutes (300 seconds)
    
    const pendingPayment: PendingPayment = {
      studentId,
      amount,
      transactionCode,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    };

    // Store pending payment
    this.pendingPayments.set(transactionCode, pendingPayment);
    
    // Also store by studentId for quick lookup
    this.pendingPayments.set(`student_${studentId}`, pendingPayment);

    this.logger.log(`Created pending payment: ${transactionCode} for student ${studentId}`);

    return {
      transactionCode,
      amount,
      expiresIn,
    };
  }

  /**
   * Handle SePay webhook - called when bank receives money
   * Documentation: https://docs.sepay.vn/tich-hop-webhooks.html
   */
  async handleSepayWebhook(dto: SepayWebhookDto, signature?: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Received SePay webhook: ${JSON.stringify(dto)}`);

    // Check for duplicate transaction (SePay recommendation)
    // Use combination of id + referenceCode + transferType + transferAmount for uniqueness
    const transactionKey = `${dto.id}_${dto.referenceCode || ''}_${dto.transferType}_${dto.transferAmount}`;
    
    if (this.processedTransactions.has(transactionKey)) {
      this.logger.warn(`Duplicate transaction detected: ${transactionKey}`);
      // Return success to prevent SePay retry for duplicate
      return { success: true, message: 'Transaction already processed' };
    }

    // Only process incoming transfers
    if (dto.transferType !== 'in') {
      return { success: true, message: 'Ignored outgoing transfer' };
    }

    // Extract transaction code from content
    // Expected format: "Thanh toan Lingriser LR{studentId}{timestamp}" or contains "LR" code
    const content = dto.content?.toUpperCase() || '';
    
    // Try to find transaction code in content (format: LR + numbers/letters)
    const codeMatch = content.match(/LR[A-Z0-9]+/);
    
    if (codeMatch) {
      const transactionCode = codeMatch[0];
      const pendingPayment = this.pendingPayments.get(transactionCode);

      if (pendingPayment) {
        // Check if not expired
        if (new Date() > pendingPayment.expiresAt) {
          this.logger.warn(`Payment expired: ${transactionCode}`);
          this.pendingPayments.delete(transactionCode);
          this.pendingPayments.delete(`student_${pendingPayment.studentId}`);
          return { success: true, message: 'Payment session expired' };
        }

        // Verify amount (allow small tolerance for bank fees)
        const amountDiff = Math.abs(dto.transferAmount - pendingPayment.amount);
        if (amountDiff > 10000) { // 10,000 VND tolerance
          this.logger.warn(`Amount mismatch: expected ${pendingPayment.amount}, got ${dto.transferAmount}`);
          // Still process but log warning
        }

        // Process the payment
        await this.confirmPayment(pendingPayment.studentId);
        
        // Mark transaction as processed (prevent duplicates)
        this.processedTransactions.add(transactionKey);
        
        // Clean up pending payment
        this.pendingPayments.delete(transactionCode);
        this.pendingPayments.delete(`student_${pendingPayment.studentId}`);

        this.logger.log(`Payment confirmed for student ${pendingPayment.studentId}`);
        return { success: true, message: 'Payment confirmed' };
      }
    }

    // Fallback: Try to match by content containing "LINGRISER" or student ID
    if (content.includes('LINGRISER')) {
      this.logger.log(`Received Lingriser payment but could not match transaction code: ${content}`);
      // Could implement fuzzy matching here
    }

    return { success: true, message: 'Webhook received but no matching pending payment found' };
  }

  /**
   * Verify SePay webhook signature
   */
  verifySepaySignature(payload: string, signature: string, secretKey: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(payload)
      .digest('hex');
    
    return signature === expectedSignature;
  }

  /**
   * Confirm payment and unlock course for student
   */
  async confirmPayment(studentId: number): Promise<void> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { studentId },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found for this student');
    }

    enrollment.paid = true;
    enrollment.paidAt = new Date();

    await this.enrollmentRepo.save(enrollment);
    this.logger.log(`Payment confirmed and course unlocked for student ${studentId}`);
  }

  /**
   * Manual payment processing (for admin or demo)
   */
  async processPayment(dto: ProcessPaymentDto): Promise<{ success: boolean; message: string }> {
    const { studentId } = dto;

    await this.confirmPayment(studentId);

    // Clean up any pending payment
    this.pendingPayments.delete(`student_${studentId}`);

    return {
      success: true,
      message: 'Payment processed successfully. All modules are now unlocked.',
    };
  }

  /**
   * Check payment status for a student
   */
  async checkPaymentStatus(studentId: number): Promise<{ 
    paid: boolean; 
    paidAt: Date | null;
    pendingPayment?: {
      transactionCode: string;
      amount: number;
      expiresAt: Date;
    };
  }> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { studentId },
    });

    if (!enrollment) {
      return { paid: false, paidAt: null };
    }

    // Check for pending payment
    const pendingPayment = this.pendingPayments.get(`student_${studentId}`);

    return {
      paid: enrollment.paid,
      paidAt: enrollment.paidAt,
      pendingPayment: pendingPayment ? {
        transactionCode: pendingPayment.transactionCode,
        amount: pendingPayment.amount,
        expiresAt: pendingPayment.expiresAt,
      } : undefined,
    };
  }

  /**
   * Clean up expired pending payments (call periodically)
   */
  cleanupExpiredPayments(): void {
    const now = new Date();
    for (const [key, payment] of this.pendingPayments.entries()) {
      if (now > payment.expiresAt) {
        this.pendingPayments.delete(key);
        this.logger.log(`Cleaned up expired payment: ${key}`);
      }
    }
  }

  /**
   * Clean up old processed transaction records (prevent memory leak)
   * Keep transactions for 24 hours for duplicate detection
   */
  cleanupOldTransactions(): void {
    // In a production app, you'd want to store these in database with timestamps
    // For now, we'll limit the size of the Set
    const MAX_PROCESSED_TRANSACTIONS = 10000;
    if (this.processedTransactions.size > MAX_PROCESSED_TRANSACTIONS) {
      // Clear oldest entries (since Set maintains insertion order)
      const entries = Array.from(this.processedTransactions);
      const toRemove = entries.slice(0, entries.length - MAX_PROCESSED_TRANSACTIONS / 2);
      toRemove.forEach(key => this.processedTransactions.delete(key));
      this.logger.log(`Cleaned up ${toRemove.length} old transaction records`);
    }
  }
}
