import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('inaugural_registrations')
export class InauguralRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'parent_name' })
  parentName: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column({ name: 'primary_goal', nullable: true })
  primaryGoal: string;

  @Column({ name: 'wants_to_signup' })
  wantsToSignup: boolean;

  @Column({ name: 'interest_reason', nullable: true })
  interestReason: string;

  @Column({ name: 'rejection_reason', nullable: true })
  rejectionReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}


