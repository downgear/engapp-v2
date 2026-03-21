import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import { Student } from '../../entities/student.entity';
import { Parent } from '../../entities/parent.entity';
import { Teacher, TeacherType } from '../../entities/teacher.entity';
import { LearningHistory, ActivityType } from '../../entities/learning-history.entity';
import { LoginSession } from '../../entities/login-session.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(LearningHistory)
    private readonly learningHistoryRepository: Repository<LearningHistory>,
    @InjectRepository(LoginSession)
    private readonly loginSessionRepository: Repository<LoginSession>,
    private readonly emailService: EmailService,
  ) {}

  // ==================== USER STATISTICS ====================

  async getUserStatistics() {
    const total = await this.userRepository.count({
      where: [
        { role: UserRole.STUDENT },
        { role: UserRole.PARENT },
        { role: UserRole.TEACHER },
      ],
    });

    const studentCount = await this.userRepository.count({
      where: { role: UserRole.STUDENT },
    });

    const parentCount = await this.userRepository.count({
      where: { role: UserRole.PARENT },
    });

    const teacherCount = await this.userRepository.count({
      where: { role: UserRole.TEACHER },
    });

    const breakdown = [
      {
        role: 'student',
        count: studentCount,
        percentage: total > 0 ? Math.round((studentCount / total) * 100 * 10) / 10 : 0,
      },
      {
        role: 'parent',
        count: parentCount,
        percentage: total > 0 ? Math.round((parentCount / total) * 100 * 10) / 10 : 0,
      },
      {
        role: 'teacher',
        count: teacherCount,
        percentage: total > 0 ? Math.round((teacherCount / total) * 100 * 10) / 10 : 0,
      },
    ];

    return { total, breakdown };
  }

  // ==================== USER MANAGEMENT ====================

  async getUsers(options: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, role, search } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.role != :adminRole', { adminRole: UserRole.ADMIN });

    if (role && role !== 'all') {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.email ILIKE :search OR user.fullName ILIKE :search OR user.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [users, total] = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isLocked: user.isLocked,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isLocked: user.isLocked,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateUser(
    id: number,
    data: {
      fullName?: string;
      email?: string;
      phone?: string;
    },
  ) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('Cannot modify admin user');
    }

    if (data.email && data.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: data.email },
      });
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
      user.email = data.email;
    }

    if (data.phone && data.phone !== user.phone) {
      const existingUser = await this.userRepository.findOne({
        where: { phone: data.phone },
      });
      if (existingUser) {
        throw new BadRequestException('Phone number already exists');
      }
      user.phone = data.phone;
    }

    if (data.fullName) {
      user.fullName = data.fullName;
    }

    await this.userRepository.save(user);
    return this.getUserById(id);
  }

  async toggleUserLock(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('Cannot lock admin user');
    }

    user.isLocked = !user.isLocked;
    await this.userRepository.save(user);
    
    return {
      id: user.id,
      isLocked: user.isLocked,
      message: user.isLocked ? 'User has been locked' : 'User has been unlocked',
    };
  }

  // ==================== CREATE USER (ADMIN) ====================

  async createUser(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role: UserRole;
  }) {
    if (data.role === UserRole.ADMIN) {
      throw new BadRequestException('Cannot create admin users');
    }

    // Check email uniqueness
    const existingEmail = await this.userRepository.findOne({ where: { email: data.email } });
    if (existingEmail) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Check phone uniqueness
    if (data.phone) {
      const existingPhone = await this.userRepository.findOne({ where: { phone: data.phone } });
      if (existingPhone) {
        throw new ConflictException('Số điện thoại đã được sử dụng');
      }
    }

    // Create user
    const user = this.userRepository.create({
      email: data.email,
      passwordHash: data.password,
      fullName: data.fullName,
      phone: data.phone || undefined,
      role: data.role,
    });
    await this.userRepository.save(user);

    // Create role-specific profile
    switch (data.role) {
      case UserRole.STUDENT:
        const student = this.studentRepository.create({ userId: user.id, cefrLevel: 'A1' });
        await this.studentRepository.save(student);
        break;
      case UserRole.PARENT:
        const parent = this.parentRepository.create({ userId: user.id });
        await this.parentRepository.save(parent);
        break;
      case UserRole.TEACHER:
        const teacher = this.teacherRepository.create({ userId: user.id, teacherType: TeacherType.VIDEO_CALL });
        await this.teacherRepository.save(teacher);
        break;
    }

    // Send welcome email (non-blocking)
    this.emailService.sendWelcomeEmail(data.email, data.fullName, data.password, data.role).catch(() => {});

    return this.getUserById(user.id);
  }

  // ==================== BULK CREATE USERS ====================

  async bulkCreateUsers(users: Array<{
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role: string;
  }>) {
    const results: Array<{ success: boolean; email: string; error?: string; user?: any }> = [];

    for (const userData of users) {
      try {
        const role = userData.role as UserRole;
        if (!Object.values(UserRole).includes(role) || role === UserRole.ADMIN) {
          results.push({ success: false, email: userData.email, error: 'Invalid role' });
          continue;
        }

        const existingEmail = await this.userRepository.findOne({ where: { email: userData.email } });
        if (existingEmail) {
          results.push({ success: false, email: userData.email, error: 'Email đã được sử dụng' });
          continue;
        }

        const user = await this.createUser({
          email: userData.email,
          password: userData.password,
          fullName: userData.fullName,
          phone: userData.phone,
          role,
        });
        results.push({ success: true, email: userData.email, user });
      } catch (err) {
        results.push({ success: false, email: userData.email, error: err instanceof Error ? err.message : 'Unknown error' });
      }
    }

    return {
      total: users.length,
      succeeded: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  }

  // ==================== UPDATE USER ROLE ====================

  async updateUserRole(id: number, newRole: UserRole) {
    if (newRole === UserRole.ADMIN) {
      throw new BadRequestException('Cannot assign admin role');
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('Cannot modify admin user');
    }

    const oldRole = user.role;
    if (oldRole === newRole) {
      return this.getUserById(id);
    }

    // Remove old role-specific profile
    switch (oldRole) {
      case UserRole.STUDENT:
        await this.studentRepository.delete({ userId: user.id });
        break;
      case UserRole.PARENT:
        await this.parentRepository.delete({ userId: user.id });
        break;
      case UserRole.TEACHER:
        await this.teacherRepository.delete({ userId: user.id });
        break;
    }

    // Create new role-specific profile
    switch (newRole) {
      case UserRole.STUDENT:
        const student = this.studentRepository.create({ userId: user.id, cefrLevel: 'A1' });
        await this.studentRepository.save(student);
        break;
      case UserRole.PARENT:
        const parent = this.parentRepository.create({ userId: user.id });
        await this.parentRepository.save(parent);
        break;
      case UserRole.TEACHER:
        const teacher = this.teacherRepository.create({ userId: user.id, teacherType: TeacherType.VIDEO_CALL });
        await this.teacherRepository.save(teacher);
        break;
    }

    // Update user role
    user.role = newRole;
    await this.userRepository.save(user);

    return this.getUserById(id);
  }

  // ==================== VISIT STATISTICS ====================

  async getVisitStatistics(hours: number = 24) {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    // Get hourly login data
    const hourlyData = await this.loginSessionRepository
      .createQueryBuilder('session')
      .select("DATE_TRUNC('hour', session.logged_in_at)", 'hour')
      .addSelect('COUNT(*)', 'count')
      .where('session.logged_in_at >= :since', { since })
      .groupBy("DATE_TRUNC('hour', session.logged_in_at)")
      .orderBy('hour', 'ASC')
      .getRawMany();

    // Get total
    const total = await this.loginSessionRepository.count({
      where: {
        loggedInAt: MoreThan(since),
      },
    });

    return {
      total,
      hourlyData: hourlyData.map((item) => ({
        hour: item.hour,
        count: parseInt(item.count, 10),
      })),
    };
  }

  // ==================== PRACTICE STATISTICS ====================

  async getPracticeStatistics(hours: number = 24) {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    // Get AI practice statistics
    const aiPracticeData = await this.learningHistoryRepository
      .createQueryBuilder('lh')
      .select("DATE_TRUNC('hour', lh.start_time)", 'hour')
      .addSelect('COUNT(*)', 'count')
      .where('lh.activity_type = :type', { type: 'ai_practice' })
      .andWhere('lh.start_time >= :since', { since })
      .groupBy("DATE_TRUNC('hour', lh.start_time)")
      .orderBy('hour', 'ASC')
      .getRawMany();

    // Get Video call statistics
    const videoCallData = await this.learningHistoryRepository
      .createQueryBuilder('lh')
      .select("DATE_TRUNC('hour', lh.start_time)", 'hour')
      .addSelect('COUNT(*)', 'count')
      .where('lh.activity_type = :type', { type: 'video_call' })
      .andWhere('lh.start_time >= :since', { since })
      .groupBy("DATE_TRUNC('hour', lh.start_time)")
      .orderBy('hour', 'ASC')
      .getRawMany();

    // Get totals
    const aiPracticeTotal = await this.learningHistoryRepository.count({
      where: {
        activityType: ActivityType.AI_PRACTICE,
        startTime: MoreThan(since),
      },
    });

    const videoCallTotal = await this.learningHistoryRepository.count({
      where: {
        activityType: ActivityType.VIDEO_CALL,
        startTime: MoreThan(since),
      },
    });

    return {
      aiPractice: {
        total: aiPracticeTotal,
        hourlyData: aiPracticeData.map((item) => ({
          hour: item.hour,
          count: parseInt(item.count, 10),
        })),
      },
      videoCall: {
        total: videoCallTotal,
        hourlyData: videoCallData.map((item) => ({
          hour: item.hour,
          count: parseInt(item.count, 10),
        })),
      },
    };
  }
}
