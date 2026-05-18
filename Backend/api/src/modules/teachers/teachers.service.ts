import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Teacher, User, Booking, TeacherType, CohortCourse, Course, Cohort, UserRole } from '../../entities';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private teacherRepo: Repository<Teacher>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    @InjectRepository(CohortCourse)
    private cohortCourseRepo: Repository<CohortCourse>,
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(Cohort)
    private cohortRepo: Repository<Cohort>,
  ) { }

  async findAll(type?: TeacherType) {
    const queryBuilder = this.teacherRepo
      .createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.user', 'user')
      .where('user.is_locked = :isLocked', { isLocked: false });

    if (type) {
      queryBuilder.andWhere('(teacher.teacher_type = :type OR teacher.teacher_type = :both)', {
        type,
        both: TeacherType.BOTH,
      });
    }

    const teachers = await queryBuilder.getMany();
    return Promise.all(teachers.map((t) => this.formatTeacher(t)));
  }

  async findVideoCallTeachers() {
    return this.findAll(TeacherType.VIDEO_CALL);
  }

  async findMentors() {
    const teachers = await this.teacherRepo
      .createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.user', 'user')
      .where('user.role = :role', { role: UserRole.MENTOR })
      .andWhere('user.is_locked = :isLocked', { isLocked: false })
      .getMany();
    return Promise.all(teachers.map((t) => this.formatTeacher(t)));
  }

  async findOne(id: number) {
    const teacher = await this.teacherRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    if (teacher.user?.isLocked) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    return this.formatTeacher(teacher);
  }

  async getAvailability(teacherId: number, date: string) {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      return { date, slots: [], message: 'Video calls only available on Saturday and Sunday' };
    }

    const dbDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

    const availabilityQuery = await this.teacherRepo.manager.query(
      `SELECT slot_start_time, is_available 
       FROM teacher_availability 
       WHERE teacher_id = ? AND day_of_week = ?
       ORDER BY slot_start_time`,
      [teacherId, dbDayOfWeek],
    );

    const existingBookings = await this.bookingRepo.find({
      where: {
        teacherId,
        bookingDate: date,
        status: In(['confirmed', 'completed']),
      },
    });

    const bookedSlots = existingBookings.map((b) => b.slotStartTime);

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

  async getTeachingCourses(teacherId: number) {
    const teacher = await this.teacherRepo.findOne({
      where: { id: teacherId },
      relations: ['user'],
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }

    const cohortCourses = await this.cohortCourseRepo.find({
      where: { teacherId },
      relations: ['cohort', 'cohort.program', 'course', 'course.modules'],
      order: { cohort: { startDate: 'DESC' } },
    });

    return cohortCourses.map((cc) => ({
      id: cc.id,
      courseId: cc.courseId,
      name: cc.displayName || cc.course?.name,
      description: cc.description || cc.course?.description,
      level: cc.level,
      enrolledStudents: cc.enrolledStudents,
      maxStudents: cc.maxStudents,
      status: cc.course?.status,
      startDate: cc.course?.startDate,
      endDate: cc.course?.endDate,
      cohort: {
        id: cc.cohort.id,
        name: cc.cohort.name,
        startDate: cc.cohort.startDate,
        status: cc.cohort.status,
      },
      program: cc.cohort.program ? {
        id: cc.cohort.program.id,
        name: cc.cohort.program.name,
      } : null,
      moduleCount: cc.course?.modules?.length || 0,
    }));
  }

  private async getTeacherRatingStats(teacherId: number): Promise<{ rating: number | null; reviewCount: number }> {
    const result = await this.bookingRepo
      .createQueryBuilder('booking')
      .select('AVG(booking.studentRating)', 'avgRating')
      .addSelect('COUNT(booking.studentRating)', 'reviewCount')
      .where('booking.teacherId = :teacherId', { teacherId })
      .andWhere('booking.studentRating IS NOT NULL')
      .getRawOne();

    return {
      rating: result.avgRating ? parseFloat(parseFloat(result.avgRating).toFixed(2)) : null,
      reviewCount: parseInt(result.reviewCount) || 0,
    };
  }

  private async formatTeacher(teacher: Teacher) {
    let specialties: string[] = [];
    try {
      specialties = teacher.specialties ? JSON.parse(teacher.specialties) : [];
    } catch {
      specialties = [];
    }

    const ratingStats = await this.getTeacherRatingStats(teacher.id);

    return {
      id: teacher.id,
      name: teacher.user.fullName,
      email: teacher.user.email,
      phone: teacher.user.phone,
      avatarUrl: teacher.user.avatarUrl,
      teacherType: teacher.teacherType,
      bio: teacher.bio,
      specialties,
      rating: ratingStats.rating,
      reviewCount: ratingStats.reviewCount,
    };
  }
}

