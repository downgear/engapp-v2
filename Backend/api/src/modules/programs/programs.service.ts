import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { Program, Cohort, CohortCourse, Course, StudentCohortEnrollment, Teacher, User } from '../../entities';
import { CohortStatus } from '../../entities/cohort.entity';
import { CourseLevel } from '../../entities/cohort-course.entity';

// DTOs (using classes with class-validator decorators)
export class CreateProgramDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateProgramDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateCohortDto {
  @IsString()
  name: string;

  @IsString()
  startDate: string;

  @IsOptional()
  @IsEnum(CohortStatus)
  status?: CohortStatus;

  @IsNumber()
  programId: number;
}

export class UpdateCohortDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsEnum(CohortStatus)
  status?: CohortStatus;
}

export class CreateCohortCourseDto {
  @IsNumber()
  cohortId: number;

  @IsNumber()
  courseId: number;

  @IsOptional()
  @IsNumber()
  teacherId?: number;

  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  maxStudents?: number;
}

export class UpdateCohortCourseDto {
  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @IsOptional()
  @IsNumber()
  teacherId?: number;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  maxStudents?: number;

  @IsOptional()
  @IsNumber()
  enrolledStudents?: number;
}

@Injectable()
export class ProgramsService {
  private readonly logger = new Logger(ProgramsService.name);

  constructor(
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(Cohort)
    private cohortRepository: Repository<Cohort>,
    @InjectRepository(CohortCourse)
    private cohortCourseRepository: Repository<CohortCourse>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(StudentCohortEnrollment)
    private enrollmentRepository: Repository<StudentCohortEnrollment>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // ==================== PROGRAMS ====================

  async findAllPrograms(): Promise<Program[]> {
    return this.programRepository.find({
      where: { isActive: true },
      relations: [
        'cohorts', 
        'cohorts.cohortCourses', 
        'cohorts.cohortCourses.course', 
        'cohorts.cohortCourses.course.modules',
        'cohorts.cohortCourses.teacher',
        'cohorts.cohortCourses.teacher.user',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findProgramById(id: number): Promise<Program> {
    const program = await this.programRepository.findOne({
      where: { id },
      relations: [
        'cohorts', 
        'cohorts.cohortCourses', 
        'cohorts.cohortCourses.course', 
        'cohorts.cohortCourses.course.modules',
        'cohorts.cohortCourses.teacher',
        'cohorts.cohortCourses.teacher.user',
      ],
    });
    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }
    return program;
  }

  async createProgram(dto: CreateProgramDto): Promise<Program> {
    const program = this.programRepository.create({
      name: dto.name,
      description: dto.description,
    });
    const saved = await this.programRepository.save(program);
    this.logger.log(`Created program: ${saved.name} (ID: ${saved.id})`);
    return saved;
  }

  async updateProgram(id: number, dto: UpdateProgramDto): Promise<Program> {
    const program = await this.findProgramById(id);
    Object.assign(program, dto);
    const updated = await this.programRepository.save(program);
    this.logger.log(`Updated program: ${updated.name} (ID: ${updated.id})`);
    return updated;
  }

  async deleteProgram(id: number): Promise<void> {
    const program = await this.findProgramById(id);
    await this.programRepository.remove(program);
    this.logger.log(`Deleted program: ${program.name} (ID: ${id})`);
  }

  // ==================== COHORTS ====================

  async findCohortById(id: number): Promise<Cohort> {
    const cohort = await this.cohortRepository.findOne({
      where: { id },
      relations: [
        'program', 
        'cohortCourses', 
        'cohortCourses.course', 
        'cohortCourses.course.modules',
        'cohortCourses.teacher',
        'cohortCourses.teacher.user',
      ],
    });
    if (!cohort) {
      throw new NotFoundException(`Cohort with ID ${id} not found`);
    }
    return cohort;
  }

  async createCohort(dto: CreateCohortDto): Promise<Cohort> {
    // Verify program exists
    await this.findProgramById(dto.programId);

    const cohort = this.cohortRepository.create({
      name: dto.name,
      startDate: dto.startDate,
      status: dto.status || CohortStatus.UPCOMING,
      programId: dto.programId,
    });
    const saved = await this.cohortRepository.save(cohort);
    this.logger.log(`Created cohort: ${saved.name} (ID: ${saved.id})`);
    return saved;
  }

  async updateCohort(id: number, dto: UpdateCohortDto): Promise<Cohort> {
    const cohort = await this.findCohortById(id);
    Object.assign(cohort, dto);
    const updated = await this.cohortRepository.save(cohort);
    this.logger.log(`Updated cohort: ${updated.name} (ID: ${updated.id})`);
    return updated;
  }

  async deleteCohort(id: number): Promise<void> {
    const cohort = await this.findCohortById(id);
    await this.cohortRepository.remove(cohort);
    this.logger.log(`Deleted cohort: ${cohort.name} (ID: ${id})`);
  }

  // ==================== COHORT COURSES ====================

  async findCohortCourseById(id: number): Promise<CohortCourse> {
    const cohortCourse = await this.cohortCourseRepository.findOne({
      where: { id },
      relations: ['cohort', 'course', 'course.modules', 'teacher', 'teacher.user'],
    });
    if (!cohortCourse) {
      throw new NotFoundException(`CohortCourse with ID ${id} not found`);
    }
    return cohortCourse;
  }

  async createCohortCourse(dto: CreateCohortCourseDto): Promise<CohortCourse> {
    // Verify cohort and course exist
    await this.findCohortById(dto.cohortId);
    const course = await this.courseRepository.findOne({ where: { id: dto.courseId } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${dto.courseId} not found`);
    }

    // Validate teacher if provided
    let teacherId: number | null = null;
    if (dto.teacherId) {
      const teacher = await this.teacherRepository.findOne({
        where: { id: dto.teacherId },
        relations: ['user'],
      });
      if (!teacher) {
        throw new NotFoundException(`Teacher with ID ${dto.teacherId} not found`);
      }
      if (teacher.user?.isLocked) {
        throw new BadRequestException('Giáo viên này đã bị khóa, không thể gán cho khóa học');
      }
      teacherId = dto.teacherId;
    }

    const level = dto.level || CourseLevel.BASIC;

    // Check if this combination already exists
    const existing = await this.cohortCourseRepository.findOne({
      where: { cohortId: dto.cohortId, courseId: dto.courseId, level },
    });
    if (existing) {
      throw new ConflictException(`Khóa học với level "${level}" đã tồn tại trong cohort này. Vui lòng chọn level khác.`);
    }

    const cohortCourse = this.cohortCourseRepository.create({
      cohortId: dto.cohortId,
      courseId: dto.courseId,
      teacherId,
      level,
      displayName: dto.displayName || course.name,
      description: dto.description || course.description,
      maxStudents: dto.maxStudents || 20,
    });
    const saved = await this.cohortCourseRepository.save(cohortCourse);
    this.logger.log(`Created cohort course: ${saved.displayName} (ID: ${saved.id}) with teacher: ${teacherId || 'none'}`);
    return saved;
  }

  async updateCohortCourse(id: number, dto: UpdateCohortCourseDto): Promise<CohortCourse> {
    const cohortCourse = await this.findCohortCourseById(id);
    
    // Validate teacher if being updated
    if (dto.teacherId !== undefined) {
      if (dto.teacherId === null) {
        // Allow removing teacher
        cohortCourse.teacherId = null;
      } else {
        const teacher = await this.teacherRepository.findOne({
          where: { id: dto.teacherId },
          relations: ['user'],
        });
        if (!teacher) {
          throw new NotFoundException(`Teacher with ID ${dto.teacherId} not found`);
        }
        if (teacher.user?.isLocked) {
          throw new BadRequestException('Giáo viên này đã bị khóa, không thể gán cho khóa học');
        }
        cohortCourse.teacherId = dto.teacherId;
      }
      delete dto.teacherId; // Remove from dto to avoid double-setting
    }
    
    Object.assign(cohortCourse, dto);
    const updated = await this.cohortCourseRepository.save(cohortCourse);
    this.logger.log(`Updated cohort course: ${updated.displayName} (ID: ${updated.id})`);
    return updated;
  }

  async deleteCohortCourse(id: number): Promise<void> {
    const cohortCourse = await this.findCohortCourseById(id);
    await this.cohortCourseRepository.remove(cohortCourse);
    this.logger.log(`Deleted cohort course (ID: ${id})`);
  }

  // ==================== PUBLIC API (for students) ====================

  async getAllProgramsForPublic() {
    const programs = await this.findAllPrograms();
    
    return programs.map(program => ({
      id: program.id,
      name: program.name,
      description: program.description,
      cohorts: program.cohorts.map(cohort => ({
        id: cohort.id,
        name: cohort.name,
        startDate: cohort.startDate,
        status: cohort.status,
        courses: cohort.cohortCourses.map(cc => {
          // Determine teacher info - show null if not found or locked
          let teacherInfo: { id: number; name: string; email: string } | null = null;
          if (cc.teacher && cc.teacher.user && !cc.teacher.user.isLocked) {
            teacherInfo = {
              id: cc.teacher.id,
              name: cc.teacher.user.fullName,
              email: cc.teacher.user.email,
            };
          }
          
          return {
            id: cc.id,
            courseId: cc.courseId,
            name: cc.displayName || cc.course?.name,
            description: cc.description || cc.course?.description,
            level: cc.level,
            status: cc.course?.status,
            startDate: cc.course?.startDate,
            endDate: cc.course?.endDate,
            price: cc.course?.price,
            enrolledStudents: cc.enrolledStudents,
            maxStudents: cc.maxStudents,
            teacherId: cc.teacherId,
            teacher: teacherInfo,
            modules: cc.course?.modules?.map(m => ({
              id: m.id,
              moduleNumber: m.moduleNumber,
              title: m.title,
              topic: m.topic,
            })) || [],
          };
        }),
      })),
    }));
  }

  // ==================== STUDENT ENROLLMENTS ====================

  async enrollStudent(studentId: number, cohortCourseId: number): Promise<StudentCohortEnrollment> {
    // Check if already enrolled
    const existing = await this.enrollmentRepository.findOne({
      where: { studentId, cohortCourseId },
    });
    if (existing) {
      return existing;
    }

    // Create enrollment
    const enrollment = this.enrollmentRepository.create({
      studentId,
      cohortCourseId,
      paid: false,
    });
    const saved = await this.enrollmentRepository.save(enrollment);
    
    // Update enrolled count on cohort course
    await this.cohortCourseRepository.increment({ id: cohortCourseId }, 'enrolledStudents', 1);
    
    this.logger.log(`Student ${studentId} enrolled in cohort course ${cohortCourseId}`);
    return saved;
  }

  async getStudentEnrollment(studentId: number, cohortCourseId: number): Promise<StudentCohortEnrollment | null> {
    return this.enrollmentRepository.findOne({
      where: { studentId, cohortCourseId },
      relations: ['cohortCourse', 'cohortCourse.course', 'cohortCourse.course.modules'],
    });
  }

  async getStudentEnrollments(studentId: number): Promise<StudentCohortEnrollment[]> {
    return this.enrollmentRepository.find({
      where: { studentId },
      relations: ['cohortCourse', 'cohortCourse.course', 'cohortCourse.course.modules', 'cohortCourse.cohort'],
    });
  }

  async markEnrollmentAsPaid(studentId: number, cohortCourseId: number): Promise<StudentCohortEnrollment> {
    let enrollment = await this.enrollmentRepository.findOne({
      where: { studentId, cohortCourseId },
    });

    if (!enrollment) {
      // Auto-enroll if not enrolled
      enrollment = await this.enrollStudent(studentId, cohortCourseId);
    }

    enrollment.paid = true;
    enrollment.paidAt = new Date();
    const updated = await this.enrollmentRepository.save(enrollment);
    
    this.logger.log(`Enrollment ${enrollment.id} marked as paid for student ${studentId}`);
    return updated;
  }

  async checkEnrollmentPaid(studentId: number, cohortCourseId: number): Promise<boolean> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { studentId, cohortCourseId },
    });
    return enrollment?.paid || false;
  }
}
