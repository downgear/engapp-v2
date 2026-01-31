import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Teacher } from './teacher.entity';

@Entity('teacher_google_tokens')
export class TeacherGoogleToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'teacher_id', unique: true })
  teacherId: number;

  @OneToOne(() => Teacher)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @Column({ name: 'access_token', type: 'text' })
  accessToken: string;

  @Column({ name: 'refresh_token', type: 'text' })
  refreshToken: string;

  @Column({ name: 'token_type', default: 'Bearer' })
  tokenType: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'scope', type: 'text', nullable: true })
  scope: string;

  @Column({ name: 'google_email', nullable: true })
  googleEmail: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
