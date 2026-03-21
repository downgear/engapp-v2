import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parent, User, Student, Payment } from '../../entities';
import { ParentsService } from './parents.service';
import { ParentsController } from './parents.controller';
import { StudentsModule } from '../students/students.module';
import { ProgramsModule } from '../programs/programs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Parent, User, Student, Payment]),
    StudentsModule,
    ProgramsModule,
  ],
  controllers: [ParentsController],
  providers: [ParentsService],
  exports: [ParentsService],
})
export class ParentsModule {}

