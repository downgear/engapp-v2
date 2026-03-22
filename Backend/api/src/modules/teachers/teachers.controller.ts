import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeacherType } from '../../entities';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  findAll(@Query('type') type?: TeacherType) {
    return this.teachersService.findAll(type);
  }

  @Get('video-call')
  findVideoCallTeachers() {
    return this.teachersService.findVideoCallTeachers();
  }

  @Get('mentors')
  findMentors() {
    return this.teachersService.findMentors();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.findOne(id);
  }

  @Get(':id/availability')
  getAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Query('date') date: string,
  ) {
    return this.teachersService.getAvailability(id, date);
  }

  @Get(':id/teaching-courses')
  getTeachingCourses(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.getTeachingCourses(id);
  }
}

