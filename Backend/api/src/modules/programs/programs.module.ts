import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramsController } from './programs.controller';
import { ProgramsService } from './programs.service';
import { Program, Cohort, CohortCourse, Course, StudentCohortEnrollment, Teacher, User } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Program, Cohort, CohortCourse, Course, StudentCohortEnrollment, Teacher, User])],
  controllers: [ProgramsController],
  providers: [ProgramsService],
  exports: [ProgramsService],
})
export class ProgramsModule {}
