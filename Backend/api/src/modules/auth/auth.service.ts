import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User, Student, Parent, Teacher, UserRole, TeacherType, Course, Enrollment, EnrollmentStatus, CourseStatus, LoginSession } from '../../entities';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
  profileId: number;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    role: UserRole;
    profileId: number;
    avatarUrl: string | null;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(Parent)
    private parentRepo: Repository<Parent>,
    @InjectRepository(Teacher)
    private teacherRepo: Repository<Teacher>,
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(LoginSession)
    private loginSessionRepo: Repository<LoginSession>,
    private jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    // Check if email already exists
    const existingUser = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Check if phone already exists
    if (dto.phone) {
      const existingPhone = await this.userRepo.findOne({ where: { phone: dto.phone } });
      if (existingPhone) {
        throw new ConflictException('Số điện thoại đã được sử dụng');
      }
    }

    // Create user with plaintext password
    const user = this.userRepo.create({
      email: dto.email,
      passwordHash: dto.password, // Store as plaintext for simplicity
      phone: dto.phone,
      fullName: dto.fullName,
      role: dto.role,
    });
    await this.userRepo.save(user);

    // Create role-specific profile
    let profileId: number;

    switch (dto.role) {
      case UserRole.STUDENT:
        const student = this.studentRepo.create({
          userId: user.id,
          grade: dto.grade,
          cefrLevel: dto.cefrLevel || 'A1',
        });
        await this.studentRepo.save(student);
        profileId = student.id;
        
        // Auto-enroll student in current course
        await this.autoEnrollStudent(student.id);
        break;

      case UserRole.PARENT:
        const parent = this.parentRepo.create({
          userId: user.id,
        });
        await this.parentRepo.save(parent);
        profileId = parent.id;
        break;

      case UserRole.TEACHER:
      case UserRole.MENTOR: {
        const teacher = this.teacherRepo.create({
          userId: user.id,
          teacherType: dto.teacherType || TeacherType.VIDEO_CALL,
          bio: dto.bio,
        });
        await this.teacherRepo.save(teacher);
        profileId = teacher.id;
        break;
      }

      default:
        throw new BadRequestException('Invalid role');
    }

    // Notify user by email (same SMTP as admin-created accounts; skipped if SMTP not configured)
    await this.emailService.sendSelfRegistrationEmail(
      user.email,
      user.fullName,
      dto.password,
      dto.role,
    );

    // Generate JWT
    return this.generateAuthResponse(user, profileId);
  }

  async login(dto: LoginDto, sessionInfo?: { ipAddress?: string; userAgent?: string }): Promise<AuthResponse> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Check if user is locked
    if (user.isLocked) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin để được hỗ trợ.');
    }

    // Simple plaintext comparison
    if (dto.password !== user.passwordHash) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Log login session
    try {
      const session = this.loginSessionRepo.create({
        userId: user.id,
        ipAddress: sessionInfo?.ipAddress || null,
        userAgent: sessionInfo?.userAgent || null,
      });
      await this.loginSessionRepo.save(session);
    } catch (err) {
      console.error('Failed to log login session:', err);
      // Don't fail login if session logging fails
    }

    // Get profile ID based on role
    const profileId = await this.getProfileId(user);

    return this.generateAuthResponse(user, profileId);
  }

  async validateUser(payload: JwtPayload): Promise<User | null> {
    return this.userRepo.findOne({ where: { id: payload.sub } });
  }

  async getProfile(userId: number): Promise<any> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const profileId = await this.getProfileId(user);
    let profile: any = null;

    switch (user.role) {
      case UserRole.STUDENT:
        profile = await this.studentRepo.findOne({
          where: { userId: user.id },
          relations: ['assignedInpersonTeacher', 'assignedInpersonTeacher.user'],
        });
        break;
      case UserRole.PARENT:
        profile = await this.parentRepo.findOne({ where: { userId: user.id } });
        break;
      case UserRole.TEACHER:
        profile = await this.teacherRepo.findOne({ where: { userId: user.id } });
        break;
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      profileId,
      avatarUrl: user.avatarUrl,
      profile,
    };
  }

  private async getProfileId(user: User): Promise<number> {
    switch (user.role) {
      case UserRole.STUDENT:
        const student = await this.studentRepo.findOne({ where: { userId: user.id } });
        return student?.id || 0;
      case UserRole.PARENT:
        const parent = await this.parentRepo.findOne({ where: { userId: user.id } });
        return parent?.id || 0;
      case UserRole.TEACHER:
        const teacher = await this.teacherRepo.findOne({ where: { userId: user.id } });
        return teacher?.id || 0;
      case UserRole.ADMIN:
        // Admin doesn't have a profile table, use user id
        return user.id;
      default:
        return 0;
    }
  }

  private generateAuthResponse(user: User, profileId: number): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      profileId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        profileId,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  /**
   * Auto-enroll a new student in the current/latest active course
   */
  private async autoEnrollStudent(studentId: number): Promise<void> {
    try {
      // Find the current in_progress course, or the latest upcoming/registration_open course
      const course = await this.courseRepo.findOne({
        where: [
          { status: CourseStatus.IN_PROGRESS },
          { status: CourseStatus.REGISTRATION_OPEN },
          { status: CourseStatus.UPCOMING },
        ],
        order: { startDate: 'DESC' },
      });

      if (!course) {
        console.log(`No active course found for auto-enrollment of student ${studentId}`);
        return;
      }

      // Check if already enrolled
      const existingEnrollment = await this.enrollmentRepo.findOne({
        where: { studentId, courseId: course.id },
      });

      if (existingEnrollment) {
        console.log(`Student ${studentId} already enrolled in course ${course.id}`);
        return;
      }

      // Create enrollment
      const enrollment = this.enrollmentRepo.create({
        studentId,
        courseId: course.id,
        status: EnrollmentStatus.ACTIVE,
        currentModuleNumber: 1,
      });
      await this.enrollmentRepo.save(enrollment);

      console.log(`Auto-enrolled student ${studentId} in course "${course.name}" (ID: ${course.id})`);
    } catch (error) {
      console.error(`Failed to auto-enroll student ${studentId}:`, error);
      // Don't throw - registration should still succeed even if auto-enrollment fails
    }
  }
}

