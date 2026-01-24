import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from './course.entity';

@Entity('modules')
export class Module {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'course_id' })
  courseId: number;

  @ManyToOne(() => Course, (course) => course.modules)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ name: 'module_number' })
  moduleNumber: number;

  @Column()
  title: string;

  @Column()
  topic: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'learning_outcomes', nullable: true })
  learningOutcomes: string; // JSON string

  @Column({ name: 'week_start_date', type: 'date', nullable: true })
  weekStartDate: string;

  @Column({ name: 'week_end_date', type: 'date', nullable: true })
  weekEndDate: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

