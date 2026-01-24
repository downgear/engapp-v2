import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LearningHistory } from './learning-history.entity';

@Entity('ai_feedback')
export class AiFeedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'learning_history_id' })
  learningHistoryId: number;

  @ManyToOne(() => LearningHistory, (history) => history.aiFeedbacks)
  @JoinColumn({ name: 'learning_history_id' })
  learningHistory: LearningHistory;

  @Column({ name: 'feedback_text' })
  feedbackText: string;

  @Column({ name: 'pronunciation_notes', type: 'text', nullable: true })
  pronunciationNotes: string | null;

  @Column({ name: 'grammar_notes', type: 'text', nullable: true })
  grammarNotes: string | null;

  @Column({ name: 'fluency_notes', type: 'text', nullable: true })
  fluencyNotes: string | null;

  @Column({ name: 'vocabulary_notes', type: 'text', nullable: true })
  vocabularyNotes: string | null;

  @Column({ name: 'overall_score', type: 'real', nullable: true })
  overallScore: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

