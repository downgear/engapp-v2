import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, IsArray } from 'class-validator';
import { Program, Cohort, CohortCourse, Course, StudentCohortEnrollment, Teacher, User, Student } from '../../entities';
import { Module as CourseModule } from '../../entities/module.entity';
import { CohortStatus } from '../../entities/cohort.entity';
import { CourseLevel } from '../../entities/cohort-course.entity';
import { CourseStatus } from '../../entities/course.entity';

// DTOs (using classes with class-validator decorators) (using classes with class-validator decorators)
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

export class CreateModuleDto {
  @IsNumber()
  courseId: number;

  @IsNumber()
  moduleNumber: number;

  @IsString()
  title: string;

  @IsString()
  topic: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  weekStartDate?: string;

  @IsOptional()
  @IsString()
  weekEndDate?: string;

  @IsOptional()
  mondayContent?: {
    vocabulary?: string[];
    grammar?: string;
    activities?: string;
    notes?: string;
    imageUrl?: string;
  };

  @IsOptional()
  aiPracticeContent?: {
    topics?: string[];
    exercises?: string;
    notes?: string;
    imageUrl?: string;
  };

  @IsOptional()
  teacherSessionContent?: {
    goals?: string[];
    focus?: string;
    notes?: string;
    imageUrl?: string;
  };
  
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdateModuleDto {
  @IsOptional()
  @IsNumber()
  moduleNumber?: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  weekStartDate?: string;

  @IsOptional()
  @IsString()
  weekEndDate?: string;

  @IsOptional()
  mondayContent?: {
    vocabulary?: string[];
    grammar?: string;
    activities?: string;
    notes?: string;
    imageUrl?: string;
  } | null;

  @IsOptional()
  aiPracticeContent?: {
    topics?: string[];
    exercises?: string;
    notes?: string;
    imageUrl?: string;
  } | null;

  @IsOptional()
  teacherSessionContent?: {
    goals?: string[];
    focus?: string;
    notes?: string;
    imageUrl?: string;
  } | null;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;
}

export class CreateCourseDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @IsOptional()
  @IsString()
  imageUrl?: string;
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
    @InjectRepository(CourseModule)
    private moduleRepository: Repository<CourseModule>,
    @InjectRepository(StudentCohortEnrollment)
    private enrollmentRepository: Repository<StudentCohortEnrollment>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

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
    await this.findCohortById(dto.cohortId);
    const course = await this.courseRepository.findOne({ where: { id: dto.courseId } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${dto.courseId} not found`);
    }

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
    
    if (dto.teacherId !== undefined) {
      if (dto.teacherId === null) {
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

  async findModuleById(id: number): Promise<CourseModule> {
    const module = await this.moduleRepository.findOne({ where: { id } });
    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    return module;
  }

  async createModule(dto: CreateModuleDto): Promise<CourseModule> {
    const course = await this.courseRepository.findOne({ where: { id: dto.courseId } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${dto.courseId} not found`);
    }

    const existing = await this.moduleRepository.findOne({
      where: { courseId: dto.courseId, moduleNumber: dto.moduleNumber },
    });
    if (existing) {
      throw new ConflictException(`Module ${dto.moduleNumber} already exists in this course`);
    }

    const newModule = new CourseModule();
    newModule.courseId = dto.courseId;
    newModule.moduleNumber = dto.moduleNumber;
    newModule.title = dto.title;
    newModule.topic = dto.topic;
    newModule.description = dto.description ?? null;
    newModule.imageUrl = dto.imageUrl ?? null;
    newModule.weekStartDate = dto.weekStartDate ?? null;
    newModule.weekEndDate = dto.weekEndDate ?? null;
    newModule.mondayContent = dto.mondayContent ?? null;
    newModule.aiPracticeContent = dto.aiPracticeContent ?? null;
    newModule.teacherSessionContent = dto.teacherSessionContent ?? null;
    const saved = await this.moduleRepository.save(newModule);
    this.logger.log(`Created module ${saved.moduleNumber}: ${saved.title} for course ${dto.courseId}`);
    return saved;
  }

  async updateModule(id: number, dto: UpdateModuleDto): Promise<CourseModule> {
    const module = await this.findModuleById(id);

    if (dto.moduleNumber !== undefined && dto.moduleNumber !== module.moduleNumber) {
      const existing = await this.moduleRepository.findOne({
        where: { courseId: module.courseId, moduleNumber: dto.moduleNumber },
      });
      if (existing) {
        throw new ConflictException(`Module ${dto.moduleNumber} already exists in this course`);
      }
    }

    Object.assign(module, dto);
    const updated = await this.moduleRepository.save(module);
    this.logger.log(`Updated module ${updated.id}: ${updated.title}`);
    return updated;
  }

  async deleteModule(id: number): Promise<void> {
    const module = await this.findModuleById(id);
    await this.moduleRepository.remove(module);
    this.logger.log(`Deleted module ${id}`);
  }

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
            imageUrl: cc.course?.imageUrl,
            enrolledStudents: cc.enrolledStudents,
            maxStudents: cc.maxStudents,
            teacherId: cc.teacherId,
            teacher: teacherInfo,
            modules: cc.course?.modules?.map(m => ({
              id: m.id,
              moduleNumber: m.moduleNumber,
              title: m.title,
              topic: m.topic,
              description: m.description,
              imageUrl: m.imageUrl,
              weekStartDate: m.weekStartDate,
              weekEndDate: m.weekEndDate,
              mondayContent: m.mondayContent,
              aiPracticeContent: m.aiPracticeContent,
              teacherSessionContent: m.teacherSessionContent,
            })) || [],
          };
        }),
      })),
    }));
  }

  async enrollStudent(studentId: number, cohortCourseId: number): Promise<StudentCohortEnrollment> {
    const existing = await this.enrollmentRepository.findOne({
      where: { studentId, cohortCourseId },
    });
    if (existing) {
      return existing;
    }

    const enrollment = this.enrollmentRepository.create({
      studentId,
      cohortCourseId,
      paid: false,
    });
    const saved = await this.enrollmentRepository.save(enrollment);
    
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

  async updateCourse(id: number, dto: Partial<Pick<CreateCourseDto, 'name' | 'description' | 'startDate' | 'endDate' | 'price' | 'status' | 'imageUrl'>>): Promise<Course> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    Object.assign(course, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.startDate !== undefined && { startDate: dto.startDate }),
      ...(dto.endDate !== undefined && { endDate: dto.endDate }),
      ...(dto.price !== undefined && { price: dto.price }),
      ...(dto.status !== undefined && { status: dto.status as CourseStatus }),
      ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl || null }),
    });
    const updated = await this.courseRepository.save(course);
    this.logger.log(`Updated course: ${updated.name} (ID: ${updated.id})`);
    return updated;
  }

  async createStandaloneCourse(dto: CreateCourseDto): Promise<Course> {
    const today = dto.startDate || new Date().toISOString().split('T')[0];
    const course = this.courseRepository.create({
      name: dto.name,
      description: dto.description || '',
      startDate: dto.startDate,
      endDate: dto.endDate,
      registrationOpenDate: today,
      registrationCloseDate: today,
      price: dto.price || 0,
      imageUrl: dto.imageUrl || null,
      status: (dto.status as CourseStatus) || CourseStatus.UPCOMING,
      classDay: 'monday',
      classStartTime: '08:00',
      classEndTime: '09:30',
    });
    const saved = await this.courseRepository.save(course);
    this.logger.log(`Created standalone course: ${saved.name} (ID: ${saved.id})`);
    return saved;
  }

  async getCohortCourseEnrollments(cohortCourseId: number) {
    const enrollments = await this.enrollmentRepository.find({
      where: { cohortCourseId },
    });

    const results: Array<{
      enrollmentId: number;
      studentId: number;
      userId: number;
      fullName: string;
      email: string;
      phone: string | null;
      paid: boolean;
      paidAt: Date | null;
      enrolledAt: Date;
    }> = [];

    for (const enrollment of enrollments) {
      const student = await this.studentRepository.findOne({
        where: { id: enrollment.studentId },
      });
      if (!student) continue;
      const user = await this.userRepository.findOne({
        where: { id: student.userId },
      });
      if (!user) continue;
      results.push({
        enrollmentId: enrollment.id,
        studentId: enrollment.studentId,
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        paid: enrollment.paid,
        paidAt: enrollment.paidAt,
        enrolledAt: enrollment.enrolledAt,
      });
    }
    return results;
  }

  async enrollStudentByUserId(userId: number, cohortCourseId: number): Promise<StudentCohortEnrollment> {
    const student = await this.studentRepository.findOne({ where: { userId } });
    if (!student) {
      throw new NotFoundException(`Student profile not found for user ID ${userId}`);
    }
    const enrollment = await this.enrollStudent(student.id, cohortCourseId);
    if (!enrollment.paid) {
      enrollment.paid = true;
      enrollment.paidAt = new Date();
      await this.enrollmentRepository.save(enrollment);
    }
    return enrollment;
  }

  async getStudentEnrollmentsFormatted(studentId: number) {
    const enrollments = await this.enrollmentRepository.find({
      where: { studentId },
      relations: [
        'cohortCourse',
        'cohortCourse.course',
        'cohortCourse.course.modules',
        'cohortCourse.cohort',
        'cohortCourse.teacher',
        'cohortCourse.teacher.user',
      ],
    });

    return enrollments
      .filter(e => e.cohortCourse != null && e.cohortCourse.course != null)
      .map(e => {
        const cc = e.cohortCourse;
        let teacherInfo: { id: number; name: string; email: string } | null = null;
        if (cc.teacher?.user && !cc.teacher.user.isLocked) {
          teacherInfo = {
            id: cc.teacher.id,
            name: cc.teacher.user.fullName,
            email: cc.teacher.user.email,
          };
        }
        return {
          enrollmentId: e.id,
          studentId: e.studentId,
          cohortCourseId: e.cohortCourseId,
          paid: e.paid,
          paidAt: e.paidAt,
          enrolledAt: e.enrolledAt,
          course: {
            id: cc.id,
            courseId: cc.courseId,
            name: cc.displayName || cc.course?.name || 'Unnamed Course',
            description: cc.description || cc.course?.description || '',
            level: cc.level,
            status: cc.course?.status,
            startDate: cc.course?.startDate,
            endDate: cc.course?.endDate,
            price: cc.course?.price ?? 0,
            imageUrl: cc.course?.imageUrl ?? null,
            enrolledStudents: cc.enrolledStudents,
            maxStudents: cc.maxStudents,
            teacher: teacherInfo,
            cohortName: cc.cohort?.name,
            modules: (cc.course?.modules ?? [])
              .map(m => ({
                id: m.id,
                moduleNumber: m.moduleNumber,
                title: m.title,
                topic: m.topic,
                description: m.description,
                imageUrl: m.imageUrl,
                weekStartDate: m.weekStartDate,
                weekEndDate: m.weekEndDate,
                mondayContent: m.mondayContent,
                aiPracticeContent: m.aiPracticeContent,
                teacherSessionContent: m.teacherSessionContent,
              }))
              .sort((a, b) => a.moduleNumber - b.moduleNumber),
          },
        };
      });
  }

  async unenrollStudent(studentId: number, cohortCourseId: number): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { studentId, cohortCourseId },
    });
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }
    await this.enrollmentRepository.remove(enrollment);
    await this.cohortCourseRepository.decrement({ id: cohortCourseId }, 'enrolledStudents', 1);
    this.logger.log(`Student ${studentId} unenrolled from cohort course ${cohortCourseId}`);
  }
}
