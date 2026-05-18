import { Controller, Post, Body, Get, Param, ParseIntPipe, Headers, RawBodyRequest, Req, Logger } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { SepayWebhookDto } from './dto/sepay-webhook.dto';
import { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-pending')
  async createPendingPayment(@Body() body: { studentId: number }) {
    return this.paymentsService.createPendingPayment(body.studentId);
  }

  @Post('process')
  async processPayment(@Body() dto: ProcessPaymentDto) {
    return this.paymentsService.processPayment(dto);
  }

  @Get('status/:studentId')
  async checkPaymentStatus(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.paymentsService.checkPaymentStatus(studentId);
  }

  @Post('sepay-webhook')
  async handleSepayWebhook(
    @Body() dto: SepayWebhookDto,
    @Headers('Authorization') authorization?: string,
    @Headers('x-sepay-signature') signature?: string,
  ) {
    this.logger.log('Received SePay webhook');
    this.logger.log(`Authorization header: ${authorization ? 'present' : 'not present'}`);
    
    const sepayApiKey = process.env.SEPAY_API_KEY;
    if (sepayApiKey && authorization) {
        const providedKey = authorization
        .replace(/^Apikey\s+/i, '')
        .replace(/^Bearer\s+/i, '')
        .trim();
      
      if (providedKey !== sepayApiKey) {
        this.logger.warn('Invalid SePay API key');
        return { success: false, message: 'Invalid API key' };
      }
      this.logger.log('SePay API key verified successfully');
    }

    return this.paymentsService.handleSepayWebhook(dto, signature);
  }

  @Get('sepay-webhook')
  async sepayWebhookHealth() {
    return { 
      status: 'ok', 
      message: 'SePay webhook endpoint is active',
      timestamp: new Date().toISOString(),
    };
  }
}
