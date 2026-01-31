import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProgramsService, CreateProgramDto, UpdateProgramDto, CreateCohortDto, UpdateCohortDto, CreateCohortCourseDto, UpdateCohortCourseDto } from './programs.service';

@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  // ==================== PUBLIC ENDPOINTS ====================

  @Get()
  async getAllPrograms() {
    return this.programsService.getAllProgramsForPublic();
  }

  @Get(':id')
  async getProgramById(@Param('id', ParseIntPipe) id: number) {
    return this.programsService.findProgramById(id);
  }

  // ==================== ADMIN ENDPOINTS (Programs) ====================

  @Post()
  @UseGuards(JwtAuthGuard)
  async createProgram(@Body() dto: CreateProgramDto) {
    return this.programsService.createProgram(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateProgram(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProgramDto,
  ) {
    return this.programsService.updateProgram(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteProgram(@Param('id', ParseIntPipe) id: number) {
    await this.programsService.deleteProgram(id);
    return { success: true, message: 'Program deleted' };
  }

  // ==================== ADMIN ENDPOINTS (Cohorts) ====================

  @Get('cohorts/:id')
  async getCohortById(@Param('id', ParseIntPipe) id: number) {
    return this.programsService.findCohortById(id);
  }

  @Post('cohorts')
  @UseGuards(JwtAuthGuard)
  async createCohort(@Body() dto: CreateCohortDto) {
    return this.programsService.createCohort(dto);
  }

  @Put('cohorts/:id')
  @UseGuards(JwtAuthGuard)
  async updateCohort(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCohortDto,
  ) {
    return this.programsService.updateCohort(id, dto);
  }

  @Delete('cohorts/:id')
  @UseGuards(JwtAuthGuard)
  async deleteCohort(@Param('id', ParseIntPipe) id: number) {
    await this.programsService.deleteCohort(id);
    return { success: true, message: 'Cohort deleted' };
  }

  // ==================== ADMIN ENDPOINTS (Cohort Courses) ====================

  @Get('cohort-courses/:id')
  async getCohortCourseById(@Param('id', ParseIntPipe) id: number) {
    return this.programsService.findCohortCourseById(id);
  }

  @Post('cohort-courses')
  @UseGuards(JwtAuthGuard)
  async createCohortCourse(@Body() dto: CreateCohortCourseDto) {
    return this.programsService.createCohortCourse(dto);
  }

  @Put('cohort-courses/:id')
  @UseGuards(JwtAuthGuard)
  async updateCohortCourse(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCohortCourseDto,
  ) {
    return this.programsService.updateCohortCourse(id, dto);
  }

  @Delete('cohort-courses/:id')
  @UseGuards(JwtAuthGuard)
  async deleteCohortCourse(@Param('id', ParseIntPipe) id: number) {
    await this.programsService.deleteCohortCourse(id);
    return { success: true, message: 'Cohort course deleted' };
  }

  // ==================== STUDENT ENROLLMENT ENDPOINTS ====================

  @Post('enroll')
  @UseGuards(JwtAuthGuard)
  async enrollStudent(@Body() body: { studentId: number; cohortCourseId: number }) {
    return this.programsService.enrollStudent(body.studentId, body.cohortCourseId);
  }

  @Get('enrollment/:studentId/:cohortCourseId')
  @UseGuards(JwtAuthGuard)
  async getStudentEnrollment(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('cohortCourseId', ParseIntPipe) cohortCourseId: number,
  ) {
    return this.programsService.getStudentEnrollment(studentId, cohortCourseId);
  }

  @Get('enrollments/:studentId')
  @UseGuards(JwtAuthGuard)
  async getStudentEnrollments(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.programsService.getStudentEnrollments(studentId);
  }

  @Post('enrollment/pay')
  @UseGuards(JwtAuthGuard)
  async markEnrollmentAsPaid(@Body() body: { studentId: number; cohortCourseId: number }) {
    return this.programsService.markEnrollmentAsPaid(body.studentId, body.cohortCourseId);
  }

  @Get('enrollment/check/:studentId/:cohortCourseId')
  @UseGuards(JwtAuthGuard)
  async checkEnrollmentPaid(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('cohortCourseId', ParseIntPipe) cohortCourseId: number,
  ) {
    const paid = await this.programsService.checkEnrollmentPaid(studentId, cohortCourseId);
    return { paid };
  }
}
