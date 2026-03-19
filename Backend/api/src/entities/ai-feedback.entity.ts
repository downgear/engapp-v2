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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

