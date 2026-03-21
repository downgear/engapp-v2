import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramsController } from './programs.controller';
import { ProgramsService } from './programs.service';
import { Program, Cohort, CohortCourse, Course, StudentCohortEnrollment, Teacher, User, Student } from '../../entities';
import { Module as CourseModule } from '../../entities/module.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Program, Cohort, CohortCourse, Course, CourseModule, StudentCohortEnrollment, Teacher, User, Student])],
  controllers: [ProgramsController],
  providers: [ProgramsService],
  exports: [ProgramsService],
})
export class ProgramsModule {}
