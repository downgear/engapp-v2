import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Student } from './student.entity';
import { Module } from './module.entity';
import { Booking } from './booking.entity';
import { AiFeedback } from './ai-feedback.entity';
import { TeacherFeedback } from './teacher-feedback.entity';

export enum ActivityType {
  IN_PERSON_CLASS = 'in_person_class',
  AI_PRACTICE = 'ai_practice',
  VIDEO_CALL = 'video_call',
}

export enum LearningStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('learning_history')
export class LearningHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'module_id' })
  moduleId: number;

  @ManyToOne(() => Module)
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @Column({ name: 'activity_type', type: 'text' })
  activityType: ActivityType;

  @Column({ name: 'start_time', type: 'timestamp' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ name: 'booking_id', nullable: true })
  bookingId: number;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ type: 'text', default: LearningStatus.COMPLETED })
  status: LearningStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => AiFeedback, (feedback) => feedback.learningHistory)
  aiFeedbacks: AiFeedback[];

  @OneToMany(() => TeacherFeedback, (feedback) => feedback.learningHistory)
  teacherFeedbacks: TeacherFeedback[];
}

