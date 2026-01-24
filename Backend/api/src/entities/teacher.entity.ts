import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum TeacherType {
  IN_PERSON = 'in_person',
  VIDEO_CALL = 'video_call',
  BOTH = 'both',
}

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'teacher_type', type: 'text' })
  teacherType: TeacherType;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  specialties: string; // JSON string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

