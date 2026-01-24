import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Booking, Student, Teacher, Module, LearningHistory, BookingStatus, ActivityType, LearningStatus } from '../../entities';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
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

    return this.formatBooking(booking);
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

