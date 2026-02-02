import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student, User, Parent, Enrollment, LearningHistory, StudentVideo, Module as CourseModule, AiFeedback, ActivityType, LearningStatus, Teacher, AccountLink } from '../../entities';
import { CreateLearningHistoryDto } from './dto/create-learning-history.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Parent)
    private parentRepo: Repository<Parent>,
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(LearningHistory)
    private learningHistoryRepo: Repository<LearningHistory>,
    @InjectRepository(StudentVideo)
    private studentVideoRepo: Repository<StudentVideo>,
    @InjectRepository(CourseModule)
    private moduleRepo: Repository<CourseModule>,
    @InjectRepository(AiFeedback)
    private aiFeedbackRepo: Repository<AiFeedback>,
    @InjectRepository(Teacher)
    private teacherRepo: Repository<Teacher>,
    @InjectRepository(AccountLink)
    private accountLinkRepo: Repository<AccountLink>,
  ) {}

  async findAll() {
    const students = await this.studentRepo
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('student.assignedInpersonTeacher', 'teacher')
      .leftJoinAndSelect('teacher.user', 'teacherUser')
      // Filter out students with locked accounts
      .where('user.is_locked = :isLocked', { isLocked: false })
      .getMany();

    return students.map((student) => this.formatStudent(student));
  }

  async findOne(id: number) {
    const student = await this.studentRepo.findOne({
      where: { id },
      relations: ['user', 'assignedInpersonTeacher', 'assignedInpersonTeacher.user'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // Check if account is locked
    if (student.user?.isLocked) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return this.formatStudent(student);
  }

  async findByParentId(parentId: number) {
    // Get parent's user_id
    const parent = await this.parentRepo.findOne({
      where: { id: parentId },
      relations: ['user'],
    });

    if (!parent) {
      throw new NotFoundException(`Parent with ID ${parentId} not found`);
    }

    // Find students linked to this parent via account_links
    const students = await this.studentRepo
      .createQueryBuilder('student')
      .innerJoin('account_links', 'al', 'al.student_id = student.id')
      .innerJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('student.assignedInpersonTeacher', 'teacher')
      .leftJoinAndSelect('teacher.user', 'teacherUser')
      .where('al.linked_user_id = :parentUserId', { parentUserId: parent.userId })
      .andWhere('al.link_type = :linkType', { linkType: 'parent' })
      // Filter out students with locked accounts
      .andWhere('user.is_locked = :isLocked', { isLocked: false })
      .getMany();

    return students.map((student) => this.formatStudent(student));
  }

  async getEnrollment(studentId: number) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { studentId },
      relations: ['course', 'course.modules'],
    });

    if (!enrollment) {
      return null;
    }

    return {
      id: enrollment.id,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      currentModuleNumber: enrollment.currentModuleNumber,
      paid: enrollment.paid,
      paidAt: enrollment.paidAt,
      course: {
        id: enrollment.course.id,
        name: enrollment.course.name,
        startDate: enrollment.course.startDate,
        endDate: enrollment.course.endDate,
        status: enrollment.course.status,
        modules: enrollment.course.modules.map((m) => ({
          id: m.id,
          moduleNumber: m.moduleNumber,
          title: m.title,
          topic: m.topic,
          weekStartDate: m.weekStartDate,
          weekEndDate: m.weekEndDate,
        })),
      },
    };
  }

  async getLearningHistory(studentId: number, moduleId?: number) {
    const queryBuilder = this.learningHistoryRepo
      .createQueryBuilder('lh')
      .leftJoinAndSelect('lh.module', 'module')
      .leftJoinAndSelect('lh.aiFeedbacks', 'aiFeedback')
      .leftJoinAndSelect('lh.teacherFeedbacks', 'teacherFeedback')
      .leftJoinAndSelect('teacherFeedback.teacher', 'teacher')
      .leftJoinAndSelect('teacher.user', 'teacherUser')
      .where('lh.student_id = :studentId', { studentId })
      .orderBy('lh.created_at', 'DESC');

    if (moduleId) {
      queryBuilder.andWhere('lh.module_id = :moduleId', { moduleId });
    }

    const histories = await queryBuilder.getMany();

    return histories.map((h) => ({
      id: h.id,
      activityType: h.activityType,
      startTime: h.startTime,
      endTime: h.endTime,
      status: h.status,
      bookingId: h.bookingId || null,
      module: {
        id: h.module.id,
        moduleNumber: h.module.moduleNumber,
        title: h.module.title,
      },
      aiFeedback: h.aiFeedbacks?.[0]
        ? {
            feedbackText: h.aiFeedbacks[0].feedbackText,
            pronunciationNotes: h.aiFeedbacks[0].pronunciationNotes,
            grammarNotes: h.aiFeedbacks[0].grammarNotes,
            fluencyNotes: h.aiFeedbacks[0].fluencyNotes,
            vocabularyNotes: h.aiFeedbacks[0].vocabularyNotes,
            overallScore: h.aiFeedbacks[0].overallScore,
          }
        : null,
      teacherFeedback: h.teacherFeedbacks?.[0]
        ? {
            feedbackText: h.teacherFeedbacks[0].feedbackText,
            confidenceNotes: h.teacherFeedbacks[0].confidenceNotes,
            improvementSuggestions: h.teacherFeedbacks[0].improvementSuggestions,
            teacherName: h.teacherFeedbacks[0].teacher?.user?.fullName,
          }
        : null,
    }));
  }

  async createLearningHistory(studentId: number, dto: CreateLearningHistoryDto) {
    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    let moduleId = dto.moduleId;
    if (!moduleId) {
      const enrollment = await this.enrollmentRepo.findOne({
        where: { studentId },
        relations: ['course', 'course.modules'],
      });

      if (!enrollment || !enrollment.course?.modules?.length) {
        throw new NotFoundException('No enrollment/modules found for this student');
      }

      const currentModule = enrollment.course.modules.find(
        (m) => m.moduleNumber === enrollment.currentModuleNumber,
      );
      moduleId = currentModule?.id || enrollment.course.modules[0].id;
    }

    const module = await this.moduleRepo.findOne({ where: { id: moduleId } });
    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }

    const startTime = dto.startTime ? new Date(dto.startTime) : new Date();
    const endTime = dto.endTime ? new Date(dto.endTime) : startTime;

    const history = this.learningHistoryRepo.create({
      studentId,
      moduleId,
      activityType: dto.activityType || ActivityType.AI_PRACTICE,
      startTime,
      endTime,
      status: LearningStatus.COMPLETED,
    });

    const saved = await this.learningHistoryRepo.save(history);

    if (dto.aiFeedback) {
      const feedback = this.aiFeedbackRepo.create();
      feedback.learningHistory = saved;
      feedback.feedbackText = dto.aiFeedback.feedbackText || '';
      feedback.pronunciationNotes = dto.aiFeedback.pronunciationNotes ?? null;
      feedback.grammarNotes = dto.aiFeedback.grammarNotes ?? null;
      feedback.fluencyNotes = dto.aiFeedback.fluencyNotes ?? null;
      feedback.vocabularyNotes = dto.aiFeedback.vocabularyNotes ?? null;
      feedback.overallScore = dto.aiFeedback.overallScore ?? null;
      await this.aiFeedbackRepo.save(feedback);
    }

    return this.getLearningHistory(studentId);
  }

  async getProgressVideos(studentId: number, courseId: number) {
    const videos = await this.studentVideoRepo.find({
      where: { studentId, courseId },
      order: { videoType: 'ASC' },
    });

    const beforeVideo = videos.find((v) => v.videoType === 'before');
    const afterVideo = videos.find((v) => v.videoType === 'after');

    return {
      beforeVideo: beforeVideo
        ? {
            fileUrl: beforeVideo.fileUrl,
            fileName: beforeVideo.fileName,
            uploadedAt: beforeVideo.uploadedAt,
            duration: beforeVideo.duration,
          }
        : null,
      afterVideo: afterVideo
        ? {
            fileUrl: afterVideo.fileUrl,
            fileName: afterVideo.fileName,
            uploadedAt: afterVideo.uploadedAt,
            duration: afterVideo.duration,
          }
        : null,
    };
  }

  async getConnections(studentId: number) {
    const links = await this.accountLinkRepo.find({
      where: { studentId },
      relations: ['linkedUser'],
      order: { createdAt: 'DESC' },
    });

    const result: Array<{
      id: number;
      linkedUserId: number;
      linkType: string;
      createdAt: Date;
      user: {
        id: number;
        fullName: string;
        email: string;
        phone: string | null;
        avatarUrl: string | null;
      };
      teacher?: {
        id: number;
        teacherType: string;
        bio: string | null;
        specialties: string[];
      };
    }> = [];

    for (const link of links) {
      // Skip connections to locked accounts
      if (link.linkedUser?.isLocked) {
        continue;
      }

      const connection: typeof result[number] = {
        id: link.id,
        linkedUserId: link.linkedUserId,
        linkType: link.linkType,
        createdAt: link.createdAt,
        user: {
          id: link.linkedUser.id,
          fullName: link.linkedUser.fullName,
          email: link.linkedUser.email,
          phone: link.linkedUser.phone,
          avatarUrl: link.linkedUser.avatarUrl,
        },
      };

      // If it's a teacher link, get teacher details
      if (link.linkType === 'teacher') {
        const teacher = await this.teacherRepo.findOne({
          where: { userId: link.linkedUserId },
        });
        if (teacher) {
          connection.teacher = {
            id: teacher.id,
            teacherType: teacher.teacherType,
            bio: teacher.bio,
            specialties: teacher.specialties ? JSON.parse(teacher.specialties) : [],
          };
        }
      }

      result.push(connection);
    }

    return result;
  }

  private formatStudent(student: Student) {
    return {
      id: student.id,
      name: student.user.fullName,
      email: student.user.email,
      phone: student.user.phone,
      grade: student.grade,
      cefrLevel: student.cefrLevel,
      avatarUrl: student.user.avatarUrl,
      assignedTeacher: student.assignedInpersonTeacher
        ? {
            id: student.assignedInpersonTeacher.id,
            name: student.assignedInpersonTeacher.user.fullName,
          }
        : null,
    };
  }
}

