import { Controller, Post, Body, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('process')
  async processPayment(@Body() dto: ProcessPaymentDto) {
    return this.paymentsService.processPayment(dto);
  }

  @Get('status/:studentId')
  async checkPaymentStatus(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.paymentsService.checkPaymentStatus(studentId);
  }
}
