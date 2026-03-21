import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Student } from '../../entities/student.entity';
import { Parent } from '../../entities/parent.entity';
import { Teacher } from '../../entities/teacher.entity';
import { LearningHistory } from '../../entities/learning-history.entity';
import { LoginSession } from '../../entities/login-session.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Student, Parent, Teacher, LearningHistory, LoginSession]),
    EmailModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
