import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Student, Parent, Teacher, UserRole, TeacherType, Course, Enrollment, EnrollmentStatus, CourseStatus, LoginSession } from '../../entities';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';
import { AuthGrpcClient } from '../grpc/auth-grpc.client';

export interface JwtPayload {
  sub: string;
  iat?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: number;
    identityId: string;
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
    private readonly emailService: EmailService,
    private readonly authGrpc: AuthGrpcClient,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    if (dto.phone) {
      const existingPhone = await this.userRepo.findOne({ where: { phone: dto.phone } });
      if (existingPhone) {
        throw new ConflictException('Số điện thoại đã được sử dụng');
      }
    }

    let grpcResult: any;
    try {
      grpcResult = await this.authGrpc.registerMail({
        mail: dto.email,
        password: dto.password,
        username: dto.fullName,
      });
    } catch (err: any) {
      throw new ConflictException(err.details || 'Đăng ký thất bại');
    }

    const identityId: string = grpcResult?.identity?.id || grpcResult?.sub || '';

    const user = this.userRepo.create({
      email: dto.email,
      passwordHash: '',
      phone: dto.phone,
      fullName: dto.fullName,
      role: dto.role,
      identityId,
    });
    await this.userRepo.save(user);

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
        await this.autoEnrollStudent(student.id);
        break;

      case UserRole.PARENT:
        const parent = this.parentRepo.create({ userId: user.id });
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

    try {
      await this.authGrpc.assignRoleTo({ identity_id: identityId, role_id: dto.role });
    } catch (_) {}

    await this.emailService.sendSelfRegistrationEmail(
      user.email,
      user.fullName,
      dto.password,
      dto.role,
    );

    return this.generateAuthResponse(user, profileId, grpcResult.accessToken, grpcResult.refreshToken);
  }

  async login(dto: LoginDto, sessionInfo?: { ipAddress?: string; userAgent?: string }): Promise<AuthResponse> {
    let grpcResult: any;
    try {
      grpcResult = await this.authGrpc.loginMail({
        mail: dto.email,
        password: dto.password,
      });
    } catch (err: any) {
      throw new UnauthorizedException(err.details || 'Email hoặc mật khẩu không đúng');
    }

    const identityId: string = grpcResult.identity_id || '';

    const user = await this.userRepo.findOne({ where: { identityId } });
    if (!user) {
      throw new UnauthorizedException('Tài khoản không tồn tại trong hệ thống');
    }

    try {
      const session = this.loginSessionRepo.create({
        userId: user.id,
        ipAddress: sessionInfo?.ipAddress || null,
        userAgent: sessionInfo?.userAgent || null,
      });
      await this.loginSessionRepo.save(session);
    } catch (err) {
      console.error('Failed to log login session:', err);
    }

    const profileId = await this.getProfileId(user);

    return this.generateAuthResponse(user, profileId, grpcResult.accessToken, grpcResult.refreshToken);
  }

  async validateUser(payload: JwtPayload): Promise<any> {
    if (payload.iat) {
      try {
        await this.authGrpc.validateAccess({ identity_id: payload.sub, iat: payload.iat });
      } catch {
        throw new UnauthorizedException('Token đã bị thu hồi');
      }
    }

    const user = await this.userRepo.findOne({ where: { identityId: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    const profileId = await this.getProfileId(user);

    return {
      userId: user.id,
      identityId: user.identityId,
      email: user.email,
      role: user.role,
      profileId,
    };
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
      identityId: user.identityId,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      profileId,
      avatarUrl: user.avatarUrl,
      profile,
    };
  }

  async getProfileByEmail(email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profileId = await this.getProfileId(user);

    return {
      id: user.id,
      identityId: user.identityId,
      profileId,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
    };
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  async findByIdentityId(identityId: string) {
    return this.userRepo.findOne({ where: { identityId } });
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
        return user.id;
      default:
        return 0;
    }
  }

  private generateAuthResponse(user: User, profileId: number, accessToken: string, refreshToken?: string): AuthResponse {
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        identityId: user.identityId || '',
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        profileId,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  private async autoEnrollStudent(studentId: number): Promise<void> {
    try {
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

      const existingEnrollment = await this.enrollmentRepo.findOne({
        where: { studentId, courseId: course.id },
      });

      if (existingEnrollment) {
        console.log(`Student ${studentId} already enrolled in course ${course.id}`);
        return;
      }

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
    }
  }
}
