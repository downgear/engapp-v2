import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Teacher, User, Booking, TeacherType } from '../../entities';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private teacherRepo: Repository<Teacher>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
  ) {}

  async findAll(type?: TeacherType) {
    const queryBuilder = this.teacherRepo
      .createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.user', 'user');

    if (type) {
      queryBuilder.where('teacher.teacher_type = :type OR teacher.teacher_type = :both', {
        type,
        both: TeacherType.BOTH,
      });
    }

    const teachers = await queryBuilder.getMany();
    return teachers.map((t) => this.formatTeacher(t));
  }

  async findVideoCallTeachers() {
    return this.findAll(TeacherType.VIDEO_CALL);
  }

  async findOne(id: number) {
    const teacher = await this.teacherRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    return this.formatTeacher(teacher);
  }

  async getAvailability(teacherId: number, date: string) {
    // Get day of week (0 = Sunday, 6 = Saturday)
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    // Only Saturday (6) and Sunday (0 -> we store as 7) are available for booking
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      return { date, slots: [], message: 'Video calls only available on Saturday and Sunday' };
    }

    const dbDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

    // Get teacher's availability for this day
    const availabilityQuery = await this.teacherRepo.manager.query(
      `SELECT slot_start_time, is_available 
       FROM teacher_availability 
       WHERE teacher_id = ? AND day_of_week = ?
       ORDER BY slot_start_time`,
      [teacherId, dbDayOfWeek],
    );

    // Get existing bookings for this date
    const existingBookings = await this.bookingRepo.find({
      where: {
        teacherId,
        bookingDate: date,
        status: In(['confirmed', 'completed']),
      },
    });

    const bookedSlots = existingBookings.map((b) => b.slotStartTime);

    // Build available slots
    const slots = availabilityQuery
      .filter((a: any) => a.is_available === 1)
      .map((a: any) => ({
        startTime: a.slot_start_time,
        endTime: this.addHour(a.slot_start_time),
        isAvailable: !bookedSlots.includes(a.slot_start_time),
      }));

    return { date, slots };
  }

  private addHour(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const newHours = hours + 1;
    return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private formatTeacher(teacher: Teacher) {
    let specialties: string[] = [];
    try {
      specialties = teacher.specialties ? JSON.parse(teacher.specialties) : [];
    } catch {
      specialties = [];
    }

    return {
      id: teacher.id,
      name: teacher.user.fullName,
      email: teacher.user.email,
      phone: teacher.user.phone,
      avatarUrl: teacher.user.avatarUrl,
      teacherType: teacher.teacherType,
      bio: teacher.bio,
      specialties,
    };
  }
}

