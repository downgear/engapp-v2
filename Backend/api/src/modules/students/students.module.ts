import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student, User, Parent, Enrollment, LearningHistory, StudentVideo, Module as CourseModule, AiFeedback, Teacher, AccountLink } from '../../entities';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, User, Parent, Enrollment, LearningHistory, StudentVideo, CourseModule, AiFeedback, Teacher, AccountLink]),
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}

