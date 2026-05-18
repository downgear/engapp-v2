import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { WeeklyFocusService } from './weekly-focus.service';
import { CreateWeeklyFocusDto, UpdateWeeklyFocusDto } from './dto/weekly-focus.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('weekly-focus')
export class WeeklyFocusController {
  constructor(private readonly weeklyFocusService: WeeklyFocusService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrUpdate(@Body() dto: CreateWeeklyFocusDto) {
    return this.weeklyFocusService.createOrUpdate(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWeeklyFocusDto,
  ) {
    return this.weeklyFocusService.update(id, dto);
  }

  @Get('module/:moduleId')
  async findByModule(@Param('moduleId', ParseIntPipe) moduleId: number) {
    return this.weeklyFocusService.findByModule(moduleId);
  }

  @Get('teacher/:teacherId')
  @UseGuards(JwtAuthGuard)
  async findByTeacher(@Param('teacherId', ParseIntPipe) teacherId: number) {
    return this.weeklyFocusService.findByTeacher(teacherId);
  }

  @Get('mentor-brief')
  @UseGuards(JwtAuthGuard)
  async getMentorBrief(
    @Query('studentId', ParseIntPipe) studentId: number,
    @Query('moduleId', ParseIntPipe) moduleId: number,
  ) {
    return this.weeklyFocusService.getMentorBrief(studentId, moduleId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.weeklyFocusService.delete(id);
    return { success: true };
  }
}
