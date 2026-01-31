import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './student.entity';
import { Teacher } from './teacher.entity';
import { Module } from './module.entity';

export enum BookingStatus {
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum MeetingStatus {
  PENDING = 'pending',       // Chưa diễn ra
  IN_PROGRESS = 'in_progress', // Đang diễn ra
  ENDED = 'ended',           // Đã kết thúc
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'teacher_id' })
  teacherId: number;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @Column({ name: 'module_id' })
  moduleId: number;

  @ManyToOne(() => Module)
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @Column({ name: 'booking_date', type: 'date' })
  bookingDate: string;

  @Column({ name: 'slot_start_time' })
  slotStartTime: string;

  @Column({ name: 'slot_end_time' })
  slotEndTime: string;

  @Column({ type: 'text', default: BookingStatus.CONFIRMED })
  status: BookingStatus;

  @Column({ name: 'meeting_status', type: 'text', default: MeetingStatus.PENDING })
  meetingStatus: MeetingStatus;

  @Column({ name: 'meeting_link', nullable: true })
  meetingLink: string;

  @Column({ name: 'google_event_id', nullable: true })
  googleEventId: string;

  @Column({ name: 'ended_at', nullable: true })
  endedAt: Date;

  @Column({ name: 'teacher_feedback', type: 'text', nullable: true })
  teacherFeedback: string;

  @Column({ name: 'student_rating', nullable: true })
  studentRating: number;

  @Column({ name: 'student_comment', type: 'text', nullable: true })
  studentComment: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

