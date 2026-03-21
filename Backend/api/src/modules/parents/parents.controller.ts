import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ParentsService } from './parents.service';

@Controller('parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.parentsService.findOne(id);
  }

  @Get(':id/children')
  getChildren(@Param('id', ParseIntPipe) id: number) {
    return this.parentsService.getChildren(id);
  }

  @Get(':id/children/:studentId/learning-history')
  getChildLearningHistory(
    @Param('id', ParseIntPipe) id: number,
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('moduleId') moduleId?: string,
  ) {
    return this.parentsService.getChildLearningHistory(
      id,
      studentId,
      moduleId ? parseInt(moduleId) : undefined,
    );
  }

  @Get(':id/children/:studentId/enrollment')
  getChildEnrollment(
    @Param('id', ParseIntPipe) id: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.parentsService.getChildEnrollment(id, studentId);
  }

  @Get(':id/children/:studentId/enrollments')
  getChildEnrollments(
    @Param('id', ParseIntPipe) id: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.parentsService.getChildEnrollments(id, studentId);
  }

  @Get(':id/children/:studentId/progress-videos')
  getChildProgressVideos(
    @Param('id', ParseIntPipe) id: number,
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.parentsService.getChildProgressVideos(id, studentId, courseId);
  }

  @Get(':id/payments')
  getPayments(@Param('id', ParseIntPipe) id: number) {
    return this.parentsService.getPayments(id);
  }

  @Get(':id/children/:studentId/ai-practice-stats')
  getChildAIPracticeStats(
    @Param('id', ParseIntPipe) id: number,
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('weeks') weeks?: string,
  ) {
    return this.parentsService.getChildAIPracticeStats(
      id,
      studentId,
      weeks ? parseInt(weeks, 10) : 8,
    );
  }
}

