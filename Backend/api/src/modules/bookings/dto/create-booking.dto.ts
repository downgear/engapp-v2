import { IsNumber, IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  studentId: number;

  @IsNumber()
  teacherId: number;

  @IsNumber()
  moduleId: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'bookingDate must be in YYYY-MM-DD format' })
  bookingDate: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/, { message: 'slotStartTime must be in HH:mm format' })
  slotStartTime: string;
}

