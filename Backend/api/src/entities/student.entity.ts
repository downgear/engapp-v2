import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Teacher } from './teacher.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  grade: string;

  @Column({ name: 'cefr_level', nullable: true })
  cefrLevel: string;

  @Column({ name: 'assigned_inperson_teacher_id', nullable: true })
  assignedInpersonTeacherId: number;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'assigned_inperson_teacher_id' })
  assignedInpersonTeacher: Teacher;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

