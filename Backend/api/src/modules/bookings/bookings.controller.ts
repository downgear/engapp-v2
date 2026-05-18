import { Controller, Get, Post, Patch, Param, Body, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  findByStudent(@Query('studentId', ParseIntPipe) studentId: number) {
    return this.bookingsService.findByStudent(studentId);
  }

  @Get('by-teacher/:teacherId')
  findByTeacher(@Param('teacherId', ParseIntPipe) teacherId: number) {
    return this.bookingsService.findByTeacher(teacherId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id/complete')
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.complete(id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.cancel(id);
  }

  @Patch(':id/start-meeting')
  @UseGuards(JwtAuthGuard)
  startMeeting(
    @Param('id', ParseIntPipe) id: number,
    @Body('teacherId', ParseIntPipe) teacherId: number,
  ) {
    return this.bookingsService.startMeeting(id, teacherId);
  }

  @Patch(':id/end-meeting')
  @UseGuards(JwtAuthGuard)
  endMeeting(
    @Param('id', ParseIntPipe) id: number,
    @Body('teacherId', ParseIntPipe) teacherId: number,
  ) {
    return this.bookingsService.endMeeting(id, teacherId);
  }

  @Patch(':id/teacher-feedback')
  @UseGuards(JwtAuthGuard)
  addTeacherFeedback(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { teacherId: number; feedback: string },
  ) {
    return this.bookingsService.addTeacherFeedback(id, body.teacherId, body.feedback);
  }

  @Patch(':id/student-rating')
  @UseGuards(JwtAuthGuard)
  addStudentRating(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { studentId: number; rating: number; comment?: string },
  ) {
    return this.bookingsService.addStudentRating(id, body.studentId, body.rating, body.comment);
  }
}

