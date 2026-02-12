import { Controller, Get, Param, Query, ParseIntPipe, Post, Body, UseInterceptors, UploadedFile, Delete, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentsService } from './students.service';
import { CreateLearningHistoryDto } from './dto/create-learning-history.dto';
import { S3Service } from './s3.service';

@Controller('students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly s3Service: S3Service,
  ) {}

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

  @Get(':id/connections')
  getConnections(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.getConnections(id);
  }

  @Post(':id/upload-video')
  @UseInterceptors(FileInterceptor('video', {
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith('video/')) {
        return cb(new BadRequestException('Only video files are allowed'), false);
      }
      cb(null, true);
    },
  }))
  async uploadVideo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('videoType') videoType: 'before' | 'after',
    @Body('courseId') courseId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Video file is required');
    }
    if (!videoType || !['before', 'after'].includes(videoType)) {
      throw new BadRequestException('videoType must be "before" or "after"');
    }
    if (!courseId) {
      throw new BadRequestException('courseId is required');
    }

    // Upload to S3 in the lingriser folder
    const { url } = await this.s3Service.uploadFile(file, 'lingriser');

    // Save video metadata to database
    return this.studentsService.saveProgressVideo(
      id,
      parseInt(courseId),
      videoType,
      url,
      file.originalname,
      file.size,
    );
  }

  @Delete(':id/progress-video')
  async deleteProgressVideo(
    @Param('id', ParseIntPipe) id: number,
    @Query('videoType') videoType: 'before' | 'after',
    @Query('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.studentsService.deleteProgressVideo(id, courseId, videoType);
  }
}

