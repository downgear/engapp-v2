import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Student, AccountLink, Notification, NotificationType, Teacher, Parent } from '../../entities';
import { CreateConnectionDto } from './dto/create-connection.dto';

@Injectable()
export class ConnectionsService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(AccountLink)
    private accountLinkRepo: Repository<AccountLink>,
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(Teacher)
    private teacherRepo: Repository<Teacher>,
    @InjectRepository(Parent)
    private parentRepo: Repository<Parent>,
  ) {}

  async createConnection(dto: CreateConnectionDto) {
    // Find the user by email
    const targetUser = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (!targetUser) {
      throw new NotFoundException(`Email ${dto.email} không tồn tại trong hệ thống`);
    }

    // Validate role matches the link type
    if (dto.linkType === 'teacher') {
      if (targetUser.role !== 'teacher') {
        throw new BadRequestException(`${dto.email} không phải là giáo viên`);
      }
      // Verify teacher profile exists
      const teacher = await this.teacherRepo.findOne({ where: { userId: targetUser.id } });
      if (!teacher) {
        throw new BadRequestException(`${dto.email} không phải là giáo viên`);
      }
    } else if (dto.linkType === 'parent') {
      if (targetUser.role !== 'parent') {
        throw new BadRequestException(`${dto.email} không phải là phụ huynh`);
      }
      // Verify parent profile exists
      const parent = await this.parentRepo.findOne({ where: { userId: targetUser.id } });
      if (!parent) {
        throw new BadRequestException(`${dto.email} không phải là phụ huynh`);
      }
    }

    // Check if connection already exists
    const existingLink = await this.accountLinkRepo.findOne({
      where: {
        studentId: dto.studentId,
        linkedUserId: targetUser.id,
      },
    });

    if (existingLink) {
      throw new BadRequestException('Kết nối này đã tồn tại');
    }

    // Get student info for notification
    const student = await this.studentRepo.findOne({
      where: { id: dto.studentId },
      relations: ['user'],
    });

    if (!student) {
      throw new NotFoundException('Học sinh không tồn tại');
    }

    // Create the connection
    const connection = this.accountLinkRepo.create({
      studentId: dto.studentId,
      linkedUserId: targetUser.id,
      linkType: dto.linkType as any,
    });

    await this.accountLinkRepo.save(connection);

    // Create notification for the target user
    const notification = this.notificationRepo.create({
      userId: targetUser.id,
      type: NotificationType.CONNECTION_REQUEST,
      title: 'Yêu cầu kết nối mới',
      message: `Học sinh ${student.user.fullName} đã gửi yêu cầu kết nối với bạn`,
      data: JSON.stringify({
        studentId: dto.studentId,
        studentName: student.user.fullName,
        connectionId: connection.id,
      }),
      isRead: false,
    });

    await this.notificationRepo.save(notification);

    return {
      id: connection.id,
      linkedUserId: connection.linkedUserId,
      linkType: connection.linkType,
      createdAt: connection.createdAt,
      user: {
        id: targetUser.id,
        fullName: targetUser.fullName,
        email: targetUser.email,
      },
    };
  }

  async deleteConnection(connectionId: number) {
    const connection = await this.accountLinkRepo.findOne({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new NotFoundException('Kết nối không tồn tại');
    }

    await this.accountLinkRepo.remove(connection);
    return { success: true };
  }
}

