import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Module } from './module.entity';
import { Teacher } from './teacher.entity';

@Entity('weekly_focus')
export class WeeklyFocus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'module_id' })
  moduleId: number;

  @ManyToOne(() => Module)
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @Column({ name: 'teacher_id' })
  teacherId: number;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @Column({ name: 'week_topic' })
  weekTopic: string;

  @Column({ name: 'speaking_goals', type: 'text', array: true, default: '{}' })
  speakingGoals: string[];

  @Column({ name: 'teacher_notes', type: 'text', nullable: true })
  teacherNotes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
