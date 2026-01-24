import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { CoursesModule } from './modules/courses/courses.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ParentsModule } from './modules/parents/parents.module';
import { AIPracticeModule } from './modules/ai-practice/ai-practice.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    StudentsModule,
    TeachersModule,
    CoursesModule,
    BookingsModule,
    ParentsModule,
    AIPracticeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
