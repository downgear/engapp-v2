import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Student } from './student.entity';
import { User } from './user.entity';

export enum LinkType {
  PARENT = 'parent',
  TEACHER = 'teacher',
}

@Entity('account_links')
export class AccountLink {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @Column({ name: 'linked_user_id' })
  linkedUserId: number;

  @Column({ name: 'link_type', type: 'text' })
  linkType: LinkType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'linked_user_id' })
  linkedUser: User;
}

