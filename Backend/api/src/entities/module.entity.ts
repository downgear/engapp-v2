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

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string | null;

  @Column({ name: 'learning_outcomes', type: 'text', nullable: true })
  learningOutcomes: string | null;

  @Column({ name: 'week_start_date', type: 'date', nullable: true })
  weekStartDate: string | null;

  @Column({ name: 'week_end_date', type: 'date', nullable: true })
  weekEndDate: string | null;

  @Column({ name: 'monday_content', type: 'jsonb', nullable: true })
  mondayContent: {
    vocabulary?: string[];
    grammar?: string;
    activities?: string;
    notes?: string;
    imageUrl?: string;
  } | null;

  @Column({ name: 'ai_practice_content', type: 'jsonb', nullable: true })
  aiPracticeContent: {
    topics?: string[];
    exercises?: string;
    notes?: string;
    imageUrl?: string;
  } | null;

  @Column({ name: 'teacher_session_content', type: 'jsonb', nullable: true })
  teacherSessionContent: {
    goals?: string[];
    focus?: string;
    notes?: string;
    imageUrl?: string;
  } | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

