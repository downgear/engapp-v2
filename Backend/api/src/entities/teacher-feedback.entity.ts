import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LearningHistory } from './learning-history.entity';
import { Teacher } from './teacher.entity';

@Entity('teacher_feedback')
export class TeacherFeedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'learning_history_id' })
  learningHistoryId: number;

  @ManyToOne(() => LearningHistory, (history) => history.teacherFeedbacks)
  @JoinColumn({ name: 'learning_history_id' })
  learningHistory: LearningHistory;

  @Column({ name: 'teacher_id' })
  teacherId: number;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @Column({ name: 'feedback_text' })
  feedbackText: string;

  @Column({ name: 'confidence_notes', nullable: true })
  confidenceNotes: string;

  @Column({ name: 'improvement_suggestions', nullable: true })
  improvementSuggestions: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

