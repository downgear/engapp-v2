import { IsNumber, IsString, IsArray, IsOptional } from 'class-validator';

export class CreateWeeklyFocusDto {
  @IsNumber()
  moduleId: number;

  @IsNumber()
  teacherId: number;

  @IsString()
  weekTopic: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  speakingGoals?: string[];

  @IsString()
  @IsOptional()
  teacherNotes?: string;
}

export class UpdateWeeklyFocusDto {
  @IsString()
  @IsOptional()
  weekTopic?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  speakingGoals?: string[];

  @IsString()
  @IsOptional()
  teacherNotes?: string;
}
