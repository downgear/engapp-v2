import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProgramsService, CreateProgramDto, UpdateProgramDto, CreateCohortDto, UpdateCohortDto, CreateCohortCourseDto, UpdateCohortCourseDto, CreateModuleDto, UpdateModuleDto, CreateCourseDto } from './programs.service';
import { ProgramS3Service } from './s3.service';

@Controller('programs')
export class ProgramsController {
  constructor(
    private readonly programsService: ProgramsService,
    private readonly programS3Service: ProgramS3Service,
  ) {}

  @Get()
  async getAllPrograms() {
    return this.programsService.getAllProgramsForPublic();
  }

  @Get(':id')
  async getProgramById(@Param('id', ParseIntPipe) id: number) {
    return this.programsService.findProgramById(id);
  }

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

  @Post('courses')
  @UseGuards(JwtAuthGuard)
  async createCourse(@Body() dto: CreateCourseDto) {
    return this.programsService.createStandaloneCourse(dto);
  }

  @Put('courses/:id')
  @UseGuards(JwtAuthGuard)
  async updateCourse(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateCourseDto>) {
    return this.programsService.updateCourse(id, dto);
  }

  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new BadRequestException('Only image files are allowed'), false);
      }
      cb(null, true);
    },
  }))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ) {
    if (!file) throw new BadRequestException('Image file is required');
    const imageUrl = await this.programS3Service.uploadImage(file, folder || 'lingriser/images');
    return { imageUrl };
  }

  @Post('modules')
  @UseGuards(JwtAuthGuard)
  async createModule(@Body() dto: CreateModuleDto) {
    return this.programsService.createModule(dto);
  }

  @Put('modules/:id')
  @UseGuards(JwtAuthGuard)
  async updateModule(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateModuleDto,
  ) {
    return this.programsService.updateModule(id, dto);
  }

  @Delete('modules/:id')
  @UseGuards(JwtAuthGuard)
  async deleteModule(@Param('id', ParseIntPipe) id: number) {
    await this.programsService.deleteModule(id);
    return { success: true, message: 'Module deleted' };
  }

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

  @Get('enrollments/:studentId/formatted')
  @UseGuards(JwtAuthGuard)
  async getStudentEnrollmentsFormatted(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.programsService.getStudentEnrollmentsFormatted(studentId);
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

  @Get('cohort-courses/:id/enrollments')
  @UseGuards(JwtAuthGuard)
  async getCohortCourseEnrollments(@Param('id', ParseIntPipe) id: number) {
    return this.programsService.getCohortCourseEnrollments(id);
  }

  @Post('enroll/by-user')
  @UseGuards(JwtAuthGuard)
  async enrollStudentByUserId(@Body() body: { userId: number; cohortCourseId: number }) {
    return this.programsService.enrollStudentByUserId(body.userId, body.cohortCourseId);
  }

  @Delete('enroll/:studentId/:cohortCourseId')
  @UseGuards(JwtAuthGuard)
  async unenrollStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('cohortCourseId', ParseIntPipe) cohortCourseId: number,
  ) {
    await this.programsService.unenrollStudent(studentId, cohortCourseId);
    return { success: true, message: 'Student unenrolled' };
  }
}
