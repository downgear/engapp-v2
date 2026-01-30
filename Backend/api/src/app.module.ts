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
import { ConnectionsModule } from './modules/connections/connections.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { InauguralRegistrationsModule } from './modules/inaugural-registrations/inaugural-registrations.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AdminModule } from './modules/admin/admin.module';
import { ChatModule } from './modules/chat/chat.module';
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
    ConnectionsModule,
    NotificationsModule,
    InauguralRegistrationsModule,
    PaymentsModule,
    AdminModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
