import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parent, User, Payment } from '../../entities';
import { StudentsService } from '../students/students.service';
import { ProgramsService } from '../programs/programs.service';

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
    private programsService: ProgramsService,
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
    const children = await this.studentsService.findByParentId(parentId);
    const hasAccess = children.some((c) => c.id === studentId);
    if (!hasAccess) {
      throw new NotFoundException('Student not found or not linked to this parent');
    }

    // Use the new StudentCohortEnrollment system first; fall back to old Enrollment table
    const cohortEnrollments = await this.programsService.getStudentEnrollmentsFormatted(studentId);
    if (cohortEnrollments.length > 0) {
      // Return the most recently enrolled course shaped like the legacy Enrollment response
      const latest = cohortEnrollments[cohortEnrollments.length - 1];
      const currentModuleNumber = this.computeCurrentModuleNumber(latest.course.modules);
      return {
        id: latest.enrollmentId,
        status: latest.paid ? 'active' : 'pending',
        enrolledAt: latest.enrolledAt,
        currentModuleNumber,
        paid: latest.paid,
        paidAt: latest.paidAt,
        course: {
          id: latest.course.id,
          name: latest.course.name,
          startDate: latest.course.startDate || '',
          endDate: latest.course.endDate || '',
          status: latest.course.status || 'upcoming',
          modules: latest.course.modules,
        },
      };
    }

    // Fallback: legacy enrollment table
    return this.studentsService.getEnrollment(studentId);
  }

  async getChildEnrollments(parentId: number, studentId: number) {
    const children = await this.studentsService.findByParentId(parentId);
    const hasAccess = children.some((c) => c.id === studentId);
    if (!hasAccess) {
      throw new NotFoundException('Student not found or not linked to this parent');
    }
    return this.programsService.getStudentEnrollmentsFormatted(studentId);
  }

  /** Determine which module is currently active based on week dates. */
  private computeCurrentModuleNumber(modules: { moduleNumber: number; weekStartDate?: string | null; weekEndDate?: string | null }[]): number {
    if (!modules.length) return 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const m of modules) {
      if (!m.weekStartDate || !m.weekEndDate) continue;
      const start = new Date(m.weekStartDate);
      const end = new Date(m.weekEndDate);
      end.setHours(23, 59, 59, 999);
      if (today >= start && today <= end) return m.moduleNumber;
    }
    // Before course starts → module 1; after course ends → last module
    const sorted = [...modules].sort((a, b) => a.moduleNumber - b.moduleNumber);
    const first = sorted[0];
    if (first.weekStartDate && today < new Date(first.weekStartDate)) return 1;
    return sorted[sorted.length - 1].moduleNumber;
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

