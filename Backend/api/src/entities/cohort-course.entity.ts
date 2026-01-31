import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Cohort } from './cohort.entity';
import { Course } from './course.entity';

export enum CourseLevel {
  BASIC = 'basic',
  ADVANCED = 'advanced',
}

@Entity('cohort_courses')
export class CohortCourse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cohort_id' })
  cohortId: number;

  @Column({ name: 'course_id' })
  courseId: number;

  @Column({ type: 'text', default: CourseLevel.BASIC })
  level: CourseLevel;

  @Column({ name: 'display_name', nullable: true })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'enrolled_students', default: 0 })
  enrolledStudents: number;

  @Column({ name: 'max_students', default: 20 })
  maxStudents: number;

  @ManyToOne(() => Cohort, (cohort) => cohort.cohortCourses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cohort_id' })
  cohort: Cohort;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
