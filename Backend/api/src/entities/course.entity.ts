import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Module } from './module.entity';

export enum CourseStatus {
  UPCOMING = 'upcoming',
  REGISTRATION_OPEN = 'registration_open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ name: 'registration_open_date', type: 'date' })
  registrationOpenDate: string;

  @Column({ name: 'registration_close_date', type: 'date' })
  registrationCloseDate: string;

  @Column()
  price: number;

  @Column({ type: 'text', default: CourseStatus.UPCOMING })
  status: CourseStatus;

  @Column({ name: 'class_day', default: 'monday' })
  classDay: string;

  @Column({ name: 'class_start_time', default: '08:00' })
  classStartTime: string;

  @Column({ name: 'class_end_time', default: '09:30' })
  classEndTime: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Module, (module) => module.course)
  modules: Module[];
}

