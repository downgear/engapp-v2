import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parent, User, Payment } from '../../entities';
import { StudentsService } from '../students/students.service';

@Injectable()
export class ParentsService {
  constructor(
    @InjectRepository(Parent)
    private parentRepo: Repository<Parent>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    private studentsService: StudentsService,
  ) {}

  async findOne(id: number) {
    const parent = await this.parentRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!parent) {
      throw new NotFoundException(`Parent with ID ${id} not found`);
    }

    return this.formatParent(parent);
  }

  async getChildren(parentId: number) {
    return this.studentsService.findByParentId(parentId);
  }

  async getChildLearningHistory(parentId: number, studentId: number, moduleId?: number) {
    // Verify parent has access to this student
    const children = await this.studentsService.findByParentId(parentId);
    const hasAccess = children.some((c) => c.id === studentId);

    if (!hasAccess) {
      throw new NotFoundException('Student not found or not linked to this parent');
    }

    return this.studentsService.getLearningHistory(studentId, moduleId);
  }

  async getChildEnrollment(parentId: number, studentId: number) {
    // Verify parent has access to this student
    const children = await this.studentsService.findByParentId(parentId);
    const hasAccess = children.some((c) => c.id === studentId);

    if (!hasAccess) {
      throw new NotFoundException('Student not found or not linked to this parent');
    }

    return this.studentsService.getEnrollment(studentId);
  }

  async getChildProgressVideos(parentId: number, studentId: number, courseId: number) {
    // Verify parent has access to this student
    const children = await this.studentsService.findByParentId(parentId);
    const hasAccess = children.some((c) => c.id === studentId);

    if (!hasAccess) {
      throw new NotFoundException('Student not found or not linked to this parent');
    }

    return this.studentsService.getProgressVideos(studentId, courseId);
  }

  async getChildAIPracticeStats(parentId: number, studentId: number, weeks: number = 8) {
    const children = await this.studentsService.findByParentId(parentId);
    const hasAccess = children.some((c) => c.id === studentId);

    if (!hasAccess) {
      throw new NotFoundException('Student not found or not linked to this parent');
    }

    return this.studentsService.getAIPracticeWeeklyStats(studentId, weeks);
  }

  async getPayments(parentId: number) {
    const payments = await this.paymentRepo.find({
      where: { parentId },
      relations: ['student', 'student.user', 'course'],
      order: { createdAt: 'DESC' },
    });

    return payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      status: p.status,
      paymentMethod: p.paymentMethod,
      transactionId: p.transactionId,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
      student: {
        id: p.student.id,
        name: p.student.user.fullName,
      },
      course: {
        id: p.course.id,
        name: p.course.name,
      },
    }));
  }

  private formatParent(parent: Parent) {
    return {
      id: parent.id,
      name: parent.user.fullName,
      email: parent.user.email,
      phone: parent.user.phone,
      avatarUrl: parent.user.avatarUrl,
    };
  }
}

