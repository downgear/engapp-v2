import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking, Student, Teacher, Module as CourseModule, LearningHistory, TeacherFeedback } from '../../entities';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { GoogleAuthModule } from '../google-auth/google-auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Student, Teacher, CourseModule, LearningHistory, TeacherFeedback]),
    GoogleAuthModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}

