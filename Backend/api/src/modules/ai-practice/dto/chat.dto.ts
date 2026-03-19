import { IsString, IsArray, IsOptional, ValidateNested, IsIn, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ChatMessageDto {
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  content: string;
}

export class ChatRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];

  @IsString()
  level: string;

  @IsString()
  topic: string;

  @IsString()
  @IsOptional()
  topicDescription?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  speakingGoals?: string[];
}

export class FeedbackRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeedbackTranscriptEntryDto)
  transcript: FeedbackTranscriptEntryDto[];

  @IsString()
  topic: string;

  @IsString()
  level: string;

  @IsString()
  @IsOptional()
  language?: string;
}

export class TranscriptWordDto {
  @IsString()
  word: string;

  @IsNumber()
  start: number;

  @IsNumber()
  end: number;
}

export class FeedbackTranscriptEntryDto {
  @IsString()
  role: string;

  @IsString()
  text: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TranscriptWordDto)
  @IsOptional()
  words?: TranscriptWordDto[];
}

export class TtsRequestDto {
  @IsString()
  text: string;
}



