import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Booking, Student, Teacher, Module, LearningHistory, BookingStatus, ActivityType, LearningStatus } from '../../entities';
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
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  async create(dto: CreateBookingDto) {
    // Validate student exists
    const student = await this.studentRepo.findOne({ where: { id: dto.studentId } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Validate teacher exists and is video call type
    const teacher = await this.teacherRepo.findOne({ where: { id: dto.teacherId } });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
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
      meetingLink: booking.meetingLink || null,
      googleEventId: booking.googleEventId || null,
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
      meetingLink: booking.meetingLink || null,
      googleEventId: booking.googleEventId || null,
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
}

