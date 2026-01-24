import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './student.entity';
import { Course } from './course.entity';

export enum VideoType {
  BEFORE = 'before',
  AFTER = 'after',
}

@Entity('student_videos')
export class StudentVideo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'course_id' })
  courseId: number;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ name: 'video_type', type: 'text' })
  videoType: VideoType;

  @Column({ name: 'file_url' })
  fileUrl: string;

  @Column({ name: 'file_name', nullable: true })
  fileName: string;

  @Column({ name: 'file_size', nullable: true })
  fileSize: number;

  @Column({ nullable: true })
  duration: number;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;
}

