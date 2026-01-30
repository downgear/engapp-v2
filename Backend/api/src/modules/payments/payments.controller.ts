import { Controller, Post, Body, Get, Param, ParseIntPipe, Headers, RawBodyRequest, Req, Logger } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { SepayWebhookDto } from './dto/sepay-webhook.dto';
import { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Create a pending payment session for a student
   * Returns transaction code to include in bank transfer content
   */
  @Post('create-pending')
  async createPendingPayment(@Body() body: { studentId: number }) {
    return this.paymentsService.createPendingPayment(body.studentId);
  }

  /**
   * Manual payment processing (for admin or demo button)
   */
  @Post('process')
  async processPayment(@Body() dto: ProcessPaymentDto) {
    return this.paymentsService.processPayment(dto);
  }

  /**
   * Check payment status for a student
   * Frontend polls this endpoint to check if payment was received
   */
  @Get('status/:studentId')
  async checkPaymentStatus(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.paymentsService.checkPaymentStatus(studentId);
  }

  /**
   * SePay Webhook endpoint
   * Called by SePay when a bank transaction is detected
   * 
   * Configure this URL in SePay dashboard:
   * https://your-domain.com/api/payments/sepay-webhook
   * 
   * SePay sends: "Authorization": "Apikey YOUR_API_KEY"
   * Response must be: { "success": true } with HTTP 200/201
   * Documentation: https://docs.sepay.vn/tich-hop-webhooks.html
   */
  @Post('sepay-webhook')
  async handleSepayWebhook(
    @Body() dto: SepayWebhookDto,
    @Headers('Authorization') authorization?: string,
    @Headers('x-sepay-signature') signature?: string,
  ) {
    this.logger.log('Received SePay webhook');
    this.logger.log(`Authorization header: ${authorization ? 'present' : 'not present'}`);
    
    // Verify API key if provided
    // SePay sends header as "Authorization":"Apikey API_KEY_CUA_BAN"
    const sepayApiKey = process.env.SEPAY_API_KEY;
    if (sepayApiKey && authorization) {
      // Handle both "Apikey " and "Bearer " prefixes (case-insensitive)
      const providedKey = authorization
        .replace(/^Apikey\s+/i, '')
        .replace(/^Bearer\s+/i, '')
        .trim();
      
      if (providedKey !== sepayApiKey) {
        this.logger.warn('Invalid SePay API key');
        // Return success: false but with HTTP 200 to prevent unnecessary retries
        return { success: false, message: 'Invalid API key' };
      }
      this.logger.log('SePay API key verified successfully');
    }

    // Process the webhook
    return this.paymentsService.handleSepayWebhook(dto, signature);
  }

  /**
   * Health check for webhook
   */
  @Get('sepay-webhook')
  async sepayWebhookHealth() {
    return { 
      status: 'ok', 
      message: 'SePay webhook endpoint is active',
      timestamp: new Date().toISOString(),
    };
  }
}
