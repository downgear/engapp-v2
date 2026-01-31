import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleAuthController } from './google-auth.controller';
import { GoogleAuthService } from './google-auth.service';
import { GoogleCalendarService } from './google-calendar.service';
import { TeacherGoogleToken, Teacher } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([TeacherGoogleToken, Teacher])],
  controllers: [GoogleAuthController],
  providers: [GoogleAuthService, GoogleCalendarService],
  exports: [GoogleAuthService, GoogleCalendarService],
})
export class GoogleAuthModule {}
