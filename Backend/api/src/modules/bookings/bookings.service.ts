import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Booking, Student, Teacher, Module, LearningHistory, BookingStatus, ActivityType, LearningStatus, TeacherFeedback } from '../../entities';
import { MeetingStatus } from '../../entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { GoogleCalendarService } from '../google-auth/google-calendar.service';
import { GoogleAuthService } from '../google-auth/google-auth.service';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(Teacher)
    private teacherRepo: Repository<Teacher>,
    @InjectRepository(Module)
    private moduleRepo: Repository<Module>,
    @InjectRepository(LearningHistory)
    private learningHistoryRepo: Repository<LearningHistory>,
    @InjectRepository(TeacherFeedback)
    private teacherFeedbackRepo: Repository<TeacherFeedback>,
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  async create(dto: CreateBookingDto) {
    // Validate student exists and account is not locked
    const student = await this.studentRepo.findOne({ 
      where: { id: dto.studentId },
      relations: ['user'],
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    if (student.user?.isLocked) {
      throw new BadRequestException('Student account is locked');
    }

    // Validate teacher exists, is video call type, and account is not locked
    const teacher = await this.teacherRepo.findOne({ 
      where: { id: dto.teacherId },
      relations: ['user'],
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    if (teacher.user?.isLocked) {
      throw new BadRequestException('Teacher is not available');
    }
    if (teacher.teacherType === 'in_person') {
      throw new BadRequestException('This teacher is not available for video calls');
    }

    // Validate module exists
    const module = await this.moduleRepo.findOne({ where: { id: dto.moduleId } });
    if (!module) {
      throw new NotFoundException('Module not found');
    }

    // Check if slot is available
    const existingBooking = await this.bookingRepo.findOne({
      where: {
        teacherId: dto.teacherId,
        bookingDate: dto.bookingDate,
        slotStartTime: dto.slotStartTime,
        status: In([BookingStatus.CONFIRMED, BookingStatus.COMPLETED]),
      },
    });

    if (existingBooking) {
      throw new BadRequestException('This time slot is already booked');
    }

    // Create booking (auto-confirmed)
    const booking = this.bookingRepo.create({
      studentId: dto.studentId,
      teacherId: dto.teacherId,
      moduleId: dto.moduleId,
      bookingDate: dto.bookingDate,
      slotStartTime: dto.slotStartTime,
      slotEndTime: this.addHour(dto.slotStartTime),
      status: BookingStatus.CONFIRMED,
    });

    const savedBooking = await this.bookingRepo.save(booking);

    // Try to create Google Meet link if teacher has connected Google
    try {
      const googleStatus = await this.googleAuthService.isConnected(dto.teacherId);
      
      if (googleStatus.connected) {
        // Get student user info for attendee
        const studentWithUser = await this.studentRepo.findOne({
          where: { id: dto.studentId },
          relations: ['user'],
        });

        // Get teacher user info
        const teacherWithUser = await this.teacherRepo.findOne({
          where: { id: dto.teacherId },
          relations: ['user'],
        });

        const meetingResult = await this.googleCalendarService.createMeeting({
          teacherId: dto.teacherId,
          studentName: studentWithUser?.user?.fullName || 'Student',
          teacherName: teacherWithUser?.user?.fullName || 'Teacher',
          moduleTitle: module.title,
          bookingDate: dto.bookingDate,
          startTime: dto.slotStartTime,
          endTime: this.addHour(dto.slotStartTime),
          studentEmail: studentWithUser?.user?.email,
        });

        // Update booking with meeting link
        savedBooking.meetingLink = meetingResult.meetingLink;
        savedBooking.googleEventId = meetingResult.googleEventId;
        await this.bookingRepo.save(savedBooking);

        this.logger.log(`Created Google Meet for booking ${savedBooking.id}: ${meetingResult.meetingLink}`);
      } else {
        this.logger.log(`Teacher ${dto.teacherId} has not connected Google - no Meet link created`);
      }
    } catch (error) {
      this.logger.error(`Failed to create Google Meet: ${error.message}`);
      // Don't fail the booking - just log the error
    }

    return this.formatBooking(savedBooking);
  }

  async findByStudent(studentId: number) {
    const bookings = await this.bookingRepo.find({
      where: { studentId },
      relations: ['teacher', 'teacher.user', 'module'],
      order: { bookingDate: 'DESC', slotStartTime: 'DESC' },
    });

    return bookings.map((b) => this.formatBooking(b));
  }

  async findByTeacher(teacherId: number) {
    const bookings = await this.bookingRepo.find({
      where: { teacherId },
      relations: ['student', 'student.user', 'module'],
      order: { bookingDate: 'DESC', slotStartTime: 'DESC' },
    });

    return bookings.map((b) => this.formatBooking(b));
  }

  async findOne(id: number) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['student', 'student.user', 'teacher', 'teacher.user', 'module'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // Return detailed booking for single booking view
    return {
      id: booking.id,
      bookingDate: booking.bookingDate,
      slotStartTime: booking.slotStartTime,
      slotEndTime: booking.slotEndTime,
      status: booking.status,
      meetingStatus: booking.meetingStatus || MeetingStatus.PENDING,
      meetingLink: booking.meetingLink || null,
      googleEventId: booking.googleEventId || null,
      endedAt: booking.endedAt || null,
      teacherFeedback: booking.teacherFeedback || null,
      studentRating: booking.studentRating || null,
      studentComment: booking.studentComment || null,
      createdAt: booking.createdAt,
      student: booking.student
        ? {
            id: booking.student.id,
            name: booking.student.user?.fullName,
            email: booking.student.user?.email,
            phone: booking.student.user?.phone,
            grade: booking.student.grade,
            cefrLevel: booking.student.cefrLevel,
          }
        : undefined,
      teacher: booking.teacher
        ? {
            id: booking.teacher.id,
            name: booking.teacher.user?.fullName,
            email: booking.teacher.user?.email,
            phone: booking.teacher.user?.phone,
            bio: booking.teacher.bio,
            specialties: booking.teacher.specialties,
            teacherType: booking.teacher.teacherType,
          }
        : undefined,
      module: booking.module
        ? {
            id: booking.module.id,
            moduleNumber: booking.module.moduleNumber,
            title: booking.module.title,
            topic: booking.module.topic,
          }
        : undefined,
    };
  }

  async complete(id: number) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['student', 'teacher', 'module'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    booking.status = BookingStatus.COMPLETED;
    await this.bookingRepo.save(booking);

    // Create learning history entry
    const learningHistory = this.learningHistoryRepo.create({
      studentId: booking.studentId,
      moduleId: booking.moduleId,
      activityType: ActivityType.VIDEO_CALL,
      startTime: new Date(`${booking.bookingDate}T${booking.slotStartTime}:00`),
      endTime: new Date(`${booking.bookingDate}T${booking.slotEndTime}:00`),
      bookingId: booking.id,
      status: LearningStatus.COMPLETED,
    });
    await this.learningHistoryRepo.save(learningHistory);

    return this.formatBooking(booking);
  }

  async cancel(id: number) {
    const booking = await this.bookingRepo.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // Cancel Google Calendar event if exists
    if (booking.googleEventId) {
      try {
        await this.googleCalendarService.cancelMeeting(booking.teacherId, booking.googleEventId);
        this.logger.log(`Cancelled Google Calendar event for booking ${id}`);
      } catch (error) {
        this.logger.error(`Failed to cancel Google Calendar event: ${error.message}`);
      }
    }

    booking.status = BookingStatus.CANCELLED;
    await this.bookingRepo.save(booking);

    return this.formatBooking(booking);
  }

  private addHour(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const newHours = hours + 1;
    return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private formatBooking(booking: Booking) {
    return {
      id: booking.id,
      bookingDate: booking.bookingDate,
      slotStartTime: booking.slotStartTime,
      slotEndTime: booking.slotEndTime,
      status: booking.status,
      meetingStatus: booking.meetingStatus || MeetingStatus.PENDING,
      meetingLink: booking.meetingLink || null,
      googleEventId: booking.googleEventId || null,
      endedAt: booking.endedAt || null,
      teacherFeedback: booking.teacherFeedback || null,
      studentRating: booking.studentRating || null,
      studentComment: booking.studentComment || null,
      createdAt: booking.createdAt,
      student: booking.student
        ? {
            id: booking.student.id,
            name: booking.student.user?.fullName,
          }
        : undefined,
      teacher: booking.teacher
        ? {
            id: booking.teacher.id,
            name: booking.teacher.user?.fullName,
          }
        : undefined,
      module: booking.module
        ? {
            id: booking.module.id,
            moduleNumber: booking.module.moduleNumber,
            title: booking.module.title,
          }
        : undefined,
    };
  }

  // ==================== MEETING STATUS MANAGEMENT ====================

  /**
   * Start a meeting - change status to in_progress
   */
  async startMeeting(bookingId: number, teacherId: number) {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId, teacherId },
      relations: ['student', 'student.user', 'teacher', 'teacher.user', 'module'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found or unauthorized');
    }

    if (booking.meetingStatus === MeetingStatus.ENDED) {
      throw new BadRequestException('Meeting has already ended');
    }

    booking.meetingStatus = MeetingStatus.IN_PROGRESS;
    await this.bookingRepo.save(booking);

    this.logger.log(`Meeting started for booking ${bookingId}`);
    return this.formatBooking(booking);
  }

  /**
   * End a meeting - change status to ended and create learning history
   */
  async endMeeting(bookingId: number, teacherId: number) {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId, teacherId },
      relations: ['student', 'student.user', 'teacher', 'teacher.user', 'module'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found or unauthorized');
    }

    if (booking.meetingStatus === MeetingStatus.ENDED) {
      throw new BadRequestException('Meeting has already ended');
    }

    const now = new Date();
    booking.meetingStatus = MeetingStatus.ENDED;
    booking.endedAt = now;
    booking.status = BookingStatus.COMPLETED;
    await this.bookingRepo.save(booking);

    // Create learning history entry for the video call
    const bookingDate = new Date(booking.bookingDate);
    const [startHour, startMin] = booking.slotStartTime.split(':').map(Number);
    const startTime = new Date(bookingDate);
    startTime.setHours(startHour, startMin, 0, 0);

    const learningHistory = this.learningHistoryRepo.create({
      studentId: booking.studentId,
      moduleId: booking.moduleId,
      activityType: ActivityType.VIDEO_CALL,
      startTime: startTime,
      endTime: now,
      bookingId: booking.id,
      status: LearningStatus.COMPLETED,
    });
    await this.learningHistoryRepo.save(learningHistory);

    this.logger.log(`Meeting ended for booking ${bookingId}, learning history created`);
    return this.formatBooking(booking);
  }

  /**
   * Add teacher feedback after meeting ends
   */
  async addTeacherFeedback(bookingId: number, teacherId: number, feedback: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId, teacherId },
      relations: ['student', 'student.user', 'teacher', 'teacher.user', 'module'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found or unauthorized');
    }

    if (booking.meetingStatus !== MeetingStatus.ENDED) {
      throw new BadRequestException('Cannot add feedback before meeting ends');
    }

    booking.teacherFeedback = feedback;
    await this.bookingRepo.save(booking);

    // Find the learning history for this booking and add teacher feedback
    const learningHistory = await this.learningHistoryRepo.findOne({
      where: { bookingId: booking.id },
    });

    if (learningHistory) {
      const teacherFeedbackEntry = this.teacherFeedbackRepo.create({
        learningHistoryId: learningHistory.id,
        teacherId: teacherId,
        feedbackText: feedback,
      });
      await this.teacherFeedbackRepo.save(teacherFeedbackEntry);
      this.logger.log(`Teacher feedback saved to learning history ${learningHistory.id}`);
    }

    this.logger.log(`Teacher feedback added for booking ${bookingId}`);
    return this.formatBooking(booking);
  }

  /**
   * Add student rating after meeting ends
   */
  async addStudentRating(bookingId: number, studentId: number, rating: number, comment?: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId, studentId },
      relations: ['student', 'student.user', 'teacher', 'teacher.user', 'module'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found or unauthorized');
    }

    if (booking.meetingStatus !== MeetingStatus.ENDED) {
      throw new BadRequestException('Cannot rate before meeting ends');
    }

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    booking.studentRating = rating;
    if (comment) {
      booking.studentComment = comment;
    }
    await this.bookingRepo.save(booking);

    this.logger.log(`Student rating ${rating} added for booking ${bookingId}`);
    return this.formatBooking(booking);
  }

  /**
   * Get computed meeting status based on time and manual status
   */
  getMeetingStatusFromBooking(booking: Booking): MeetingStatus {
    // If already ended, return ended
    if (booking.meetingStatus === MeetingStatus.ENDED) {
      return MeetingStatus.ENDED;
    }

    const now = new Date();
    const bookingDate = new Date(booking.bookingDate);
    const [startHour, startMin] = booking.slotStartTime.split(':').map(Number);
    const [endHour, endMin] = booking.slotEndTime.split(':').map(Number);

    const startTime = new Date(bookingDate);
    startTime.setHours(startHour, startMin, 0, 0);

    const endTime = new Date(bookingDate);
    endTime.setHours(endHour, endMin, 0, 0);

    // If current time is past end time, auto-end the meeting
    if (now > endTime) {
      return MeetingStatus.ENDED;
    }

    // If current time is within the meeting time range
    if (now >= startTime && now <= endTime) {
      return MeetingStatus.IN_PROGRESS;
    }

    return MeetingStatus.PENDING;
  }
}

