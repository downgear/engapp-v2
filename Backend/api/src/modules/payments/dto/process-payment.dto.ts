import { IsNumber } from 'class-validator';

export class ProcessPaymentDto {
  @IsNumber()
  studentId: number;

  @IsNumber()
  moduleId: number;
}
