import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { InauguralRegistrationsService } from './inaugural-registrations.service';
import { CreateInauguralRegistrationDto } from './dto/create-inaugural-registration.dto';

@Controller('inaugural-registrations')
export class InauguralRegistrationsController {
  constructor(private readonly registrationsService: InauguralRegistrationsService) {}

  @Post()
  async create(@Body() dto: CreateInauguralRegistrationDto) {
    const registration = await this.registrationsService.create(dto);
    return { id: registration.id };
  }

  @Get()
  async findAll() {
    return this.registrationsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.registrationsService.findOne(id);
  }
}


