import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WeeklyFocus } from '../../entities/weekly-focus.entity';
import { LearningHistory, ActivityType } from '../../entities/learning-history.entity';
import { CreateWeeklyFocusDto, UpdateWeeklyFocusDto } from './dto/weekly-focus.dto';

@Injectable()
export class WeeklyFocusService {
  constructor(
    @InjectRepository(WeeklyFocus)
    private weeklyFocusRepo: Repository<WeeklyFocus>,
    @InjectRepository(LearningHistory)
    private learningHistoryRepo: Repository<LearningHistory>,
  ) {}

  async createOrUpdate(dto: CreateWeeklyFocusDto): Promise<WeeklyFocus> {
    const existing = await this.weeklyFocusRepo.findOne({
      where: { moduleId: dto.moduleId, teacherId: dto.teacherId },
    });

    if (existing) {
      Object.assign(existing, {
        weekTopic: dto.weekTopic,
        speakingGoals: dto.speakingGoals || existing.speakingGoals,
        teacherNotes: dto.teacherNotes ?? existing.teacherNotes,
      });
      return this.weeklyFocusRepo.save(existing);
    }

    const focus = this.weeklyFocusRepo.create({
      moduleId: dto.moduleId,
      teacherId: dto.teacherId,
      weekTopic: dto.weekTopic,
      speakingGoals: dto.speakingGoals || [],
      teacherNotes: dto.teacherNotes ?? null,
    });
    return this.weeklyFocusRepo.save(focus);
  }

  async update(id: number, dto: UpdateWeeklyFocusDto): Promise<WeeklyFocus> {
    const focus = await this.weeklyFocusRepo.findOne({ where: { id } });
    if (!focus) throw new NotFoundException('Weekly focus not found');

    if (dto.weekTopic !== undefined) focus.weekTopic = dto.weekTopic;
    if (dto.speakingGoals !== undefined) focus.speakingGoals = dto.speakingGoals;
    if (dto.teacherNotes !== undefined) focus.teacherNotes = dto.teacherNotes;

    return this.weeklyFocusRepo.save(focus);
  }

  async findByModule(moduleId: number): Promise<WeeklyFocus | null> {
    return this.weeklyFocusRepo.findOne({
      where: { moduleId },
      relations: ['module', 'teacher'],
    });
  }

  async findByTeacher(teacherId: number): Promise<WeeklyFocus[]> {
    return this.weeklyFocusRepo.find({
      where: { teacherId },
      relations: ['module'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMentorBrief(studentId: number, moduleId: number): Promise<{
    weeklyFocus: WeeklyFocus | null;
    aiPracticeCount: number;
    lastAiFeedbackSummary: string | null;
  }> {
    const weeklyFocus = await this.weeklyFocusRepo.findOne({
      where: { moduleId },
      relations: ['module'],
    });

    const aiPracticeCount = await this.learningHistoryRepo.count({
      where: {
        studentId,
        moduleId,
        activityType: ActivityType.AI_PRACTICE,
      },
    });

    const lastAiHistory = await this.learningHistoryRepo.findOne({
      where: {
        studentId,
        moduleId,
        activityType: ActivityType.AI_PRACTICE,
      },
      relations: ['aiFeedbacks'],
      order: { createdAt: 'DESC' },
    });

    let lastAiFeedbackSummary: string | null = null;
    if (lastAiHistory?.aiFeedbacks?.length) {
      const feedback = lastAiHistory.aiFeedbacks[0];
      lastAiFeedbackSummary = feedback.feedbackText || null;
    }

    return {
      weeklyFocus,
      aiPracticeCount,
      lastAiFeedbackSummary,
    };
  }

  async delete(id: number): Promise<void> {
    await this.weeklyFocusRepo.delete(id);
  }
}
