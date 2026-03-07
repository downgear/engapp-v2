import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { WeeklyFocusService } from './weekly-focus.service';
import { CreateWeeklyFocusDto, UpdateWeeklyFocusDto } from './dto/weekly-focus.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('weekly-focus')
export class WeeklyFocusController {
  constructor(private readonly weeklyFocusService: WeeklyFocusService) {}

  /**
   * POST /weekly-focus
   * Teacher creates/updates weekly focus after offline class
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrUpdate(@Body() dto: CreateWeeklyFocusDto) {
    return this.weeklyFocusService.createOrUpdate(dto);
  }

  /**
   * PUT /weekly-focus/:id
   * Teacher updates existing weekly focus
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWeeklyFocusDto,
  ) {
    return this.weeklyFocusService.update(id, dto);
  }

  /**
   * GET /weekly-focus/module/:moduleId
   * Get weekly focus for a specific module (used by AI practice & mentor)
   */
  @Get('module/:moduleId')
  async findByModule(@Param('moduleId', ParseIntPipe) moduleId: number) {
    return this.weeklyFocusService.findByModule(moduleId);
  }

  /**
   * GET /weekly-focus/teacher/:teacherId
   * Get all weekly focuses created by a teacher
   */
  @Get('teacher/:teacherId')
  @UseGuards(JwtAuthGuard)
  async findByTeacher(@Param('teacherId', ParseIntPipe) teacherId: number) {
    return this.weeklyFocusService.findByTeacher(teacherId);
  }

  /**
   * GET /weekly-focus/mentor-brief?studentId=&moduleId=
   * Mentor gets brief before video call: weekly topic, AI practice count, last feedback
   */
  @Get('mentor-brief')
  @UseGuards(JwtAuthGuard)
  async getMentorBrief(
    @Query('studentId', ParseIntPipe) studentId: number,
    @Query('moduleId', ParseIntPipe) moduleId: number,
  ) {
    return this.weeklyFocusService.getMentorBrief(studentId, moduleId);
  }

  /**
   * DELETE /weekly-focus/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.weeklyFocusService.delete(id);
    return { success: true };
  }
}
