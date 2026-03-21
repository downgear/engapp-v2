import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramsController } from './programs.controller';
import { ProgramsService } from './programs.service';
import { Program, Cohort, CohortCourse, Course, StudentCohortEnrollment, Teacher, User, Student } from '../../entities';
import { Module as CourseModule } from '../../entities/module.entity';
import { ProgramS3Service } from './s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([Program, Cohort, CohortCourse, Course, CourseModule, StudentCohortEnrollment, Teacher, User, Student])],
  controllers: [ProgramsController],
  providers: [ProgramsService, ProgramS3Service],
  exports: [ProgramsService],
})
export class ProgramsModule {}
