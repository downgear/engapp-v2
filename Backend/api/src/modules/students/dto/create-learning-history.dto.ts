import { IsIn, IsNumber, IsOptional, IsString, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ActivityType } from '../../../entities';

class AiFeedbackDto {
  @IsOptional()
  @IsString()
  feedbackText?: string;

  @IsOptional()
  @IsString()
  pronunciationNotes?: string;

  @IsOptional()
  @IsString()
  grammarNotes?: string;

  @IsOptional()
  @IsString()
  fluencyNotes?: string;

  @IsOptional()
  @IsString()
  vocabularyNotes?: string;

  @IsOptional()
  @IsNumber()
  overallScore?: number;
}

export class CreateLearningHistoryDto {
  @IsOptional()
  @IsNumber()
  moduleId?: number;

  @IsOptional()
  @IsIn([ActivityType.AI_PRACTICE, ActivityType.IN_PERSON_CLASS, ActivityType.VIDEO_CALL])
  activityType?: ActivityType;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AiFeedbackDto)
  aiFeedback?: AiFeedbackDto;
}

