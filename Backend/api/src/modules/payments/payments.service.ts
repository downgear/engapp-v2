import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../../entities';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { SepayWebhookDto } from './dto/sepay-webhook.dto';
import * as crypto from 'crypto';

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
  private processedTransactions: Set<string> = new Set();

  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
  ) {}

  async createPendingPayment(studentId: number): Promise<{ 
    transactionCode: string; 
    amount: number;
    expiresIn: number;
  }> {
    const timestamp = Date.now().toString(36).toUpperCase();
    const transactionCode = `LR${studentId}${timestamp}`;
    
    const amount = 2990000;
    const expiresIn = 300;
    
    const pendingPayment: PendingPayment = {
      studentId,
      amount,
      transactionCode,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    };

    this.pendingPayments.set(transactionCode, pendingPayment);
    
    this.pendingPayments.set(`student_${studentId}`, pendingPayment);

    this.logger.log(`Created pending payment: ${transactionCode} for student ${studentId}`);

    return {
      transactionCode,
      amount,
      expiresIn,
    };
  }

  async handleSepayWebhook(dto: SepayWebhookDto, signature?: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Received SePay webhook: ${JSON.stringify(dto)}`);

    const transactionKey = `${dto.id}_${dto.referenceCode || ''}_${dto.transferType}_${dto.transferAmount}`;
    
    if (this.processedTransactions.has(transactionKey)) {
      this.logger.warn(`Duplicate transaction detected: ${transactionKey}`);
      return { success: true, message: 'Transaction already processed' };
    }

    if (dto.transferType !== 'in') {
      return { success: true, message: 'Ignored outgoing transfer' };
    }

    const content = dto.content?.toUpperCase() || '';
    
    const codeMatch = content.match(/LR[A-Z0-9]+/);
    
    if (codeMatch) {
      const transactionCode = codeMatch[0];
      const pendingPayment = this.pendingPayments.get(transactionCode);

      if (pendingPayment) {
        if (new Date() > pendingPayment.expiresAt) {
          this.logger.warn(`Payment expired: ${transactionCode}`);
          this.pendingPayments.delete(transactionCode);
          this.pendingPayments.delete(`student_${pendingPayment.studentId}`);
          return { success: true, message: 'Payment session expired' };
        }

        const amountDiff = Math.abs(dto.transferAmount - pendingPayment.amount);
        if (amountDiff > 10000) {
          this.logger.warn(`Amount mismatch: expected ${pendingPayment.amount}, got ${dto.transferAmount}`);
          // Still process but log warning
        }

        await this.confirmPayment(pendingPayment.studentId);
        
        this.processedTransactions.add(transactionKey);
        
        this.pendingPayments.delete(transactionCode);
        this.pendingPayments.delete(`student_${pendingPayment.studentId}`);

        this.logger.log(`Payment confirmed for student ${pendingPayment.studentId}`);
        return { success: true, message: 'Payment confirmed' };
      }
    }

    if (content.includes('LINGRISER')) {
      this.logger.log(`Received Lingriser payment but could not match transaction code: ${content}`);
    }

    return { success: true, message: 'Webhook received but no matching pending payment found' };
  }

  verifySepaySignature(payload: string, signature: string, secretKey: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(payload)
      .digest('hex');
    
    return signature === expectedSignature;
  }

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

  async processPayment(dto: ProcessPaymentDto): Promise<{ success: boolean; message: string }> {
    const { studentId } = dto;

    await this.confirmPayment(studentId);

    this.pendingPayments.delete(`student_${studentId}`);

    return {
      success: true,
      message: 'Payment processed successfully. All modules are now unlocked.',
    };
  }

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

  cleanupExpiredPayments(): void {
    const now = new Date();
    for (const [key, payment] of this.pendingPayments.entries()) {
      if (now > payment.expiresAt) {
        this.pendingPayments.delete(key);
        this.logger.log(`Cleaned up expired payment: ${key}`);
      }
    }
  }

  cleanupOldTransactions(): void {
    const MAX_PROCESSED_TRANSACTIONS = 10000;
    if (this.processedTransactions.size > MAX_PROCESSED_TRANSACTIONS) {
      const entries = Array.from(this.processedTransactions);
      const toRemove = entries.slice(0, entries.length - MAX_PROCESSED_TRANSACTIONS / 2);
      toRemove.forEach(key => this.processedTransactions.delete(key));
      this.logger.log(`Cleaned up ${toRemove.length} old transaction records`);
    }
  }
}
