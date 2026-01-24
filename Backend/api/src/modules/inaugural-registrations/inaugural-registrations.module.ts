import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InauguralRegistration } from '../../entities/inaugural-registration.entity';
import { InauguralRegistrationsController } from './inaugural-registrations.controller';
import { InauguralRegistrationsService } from './inaugural-registrations.service';

@Module({
  imports: [TypeOrmModule.forFeature([InauguralRegistration])],
  controllers: [InauguralRegistrationsController],
  providers: [InauguralRegistrationsService],
  exports: [InauguralRegistrationsService],
})
export class InauguralRegistrationsModule {}


