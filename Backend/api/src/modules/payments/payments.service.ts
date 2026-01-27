import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../../entities';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
  ) {}

  async processPayment(dto: ProcessPaymentDto): Promise<{ success: boolean; message: string }> {
    const { studentId } = dto;

    // Find the student's enrollment
    const enrollment = await this.enrollmentRepo.findOne({
      where: { studentId },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found for this student');
    }

    // Update enrollment to mark as paid
    enrollment.paid = true;
    enrollment.paidAt = new Date();

    await this.enrollmentRepo.save(enrollment);

    return {
      success: true,
      message: 'Payment processed successfully. All modules are now unlocked.',
    };
  }

  async checkPaymentStatus(studentId: number): Promise<{ paid: boolean; paidAt: Date | null }> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { studentId },
    });

    if (!enrollment) {
      return { paid: false, paidAt: null };
    }

    return {
      paid: enrollment.paid,
      paidAt: enrollment.paidAt,
    };
  }
}
