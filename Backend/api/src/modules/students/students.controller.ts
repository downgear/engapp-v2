import { Controller, Get, Param, Query, ParseIntPipe, Post, Body } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateLearningHistoryDto } from './dto/create-learning-history.dto';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }

  @Get(':id/enrollment')
  getEnrollment(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.getEnrollment(id);
  }

  @Get(':id/learning-history')
  getLearningHistory(
    @Param('id', ParseIntPipe) id: number,
    @Query('moduleId') moduleId?: string,
  ) {
    return this.studentsService.getLearningHistory(
      id,
      moduleId ? parseInt(moduleId) : undefined,
    );
  }

  @Post(':id/learning-history')
  createLearningHistory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateLearningHistoryDto,
  ) {
    return this.studentsService.createLearningHistory(id, dto);
  }

  @Get(':id/progress-videos')
  getProgressVideos(
    @Param('id', ParseIntPipe) id: number,
    @Query('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.studentsService.getProgressVideos(id, courseId);
  }

  @Get('by-parent/:parentId')
  findByParent(@Param('parentId', ParseIntPipe) parentId: number) {
    return this.studentsService.findByParentId(parentId);
  }
}

