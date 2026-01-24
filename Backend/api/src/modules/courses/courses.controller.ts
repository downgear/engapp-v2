import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get('current')
  findCurrent() {
    return this.coursesService.findCurrent();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOne(id);
  }

  @Get(':id/modules')
  getModules(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.getModules(id);
  }

  @Get('modules/:moduleId')
  getModule(@Param('moduleId', ParseIntPipe) moduleId: number) {
    return this.coursesService.getModule(moduleId);
  }
}

