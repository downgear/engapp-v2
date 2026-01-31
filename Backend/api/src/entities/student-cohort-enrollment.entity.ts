import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Student } from './student.entity';
import { CohortCourse } from './cohort-course.entity';

@Entity('student_cohort_enrollments')
export class StudentCohortEnrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @Column({ name: 'cohort_course_id' })
  cohortCourseId: number;

  @Column({ default: false })
  paid: boolean;

  @Column({ name: 'paid_at', nullable: true })
  paidAt: Date;

  @CreateDateColumn({ name: 'enrolled_at' })
  enrolledAt: Date;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => CohortCourse, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cohort_course_id' })
  cohortCourse: CohortCourse;
}
