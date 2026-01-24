import { IsString, IsArray, IsOptional, ValidateNested, IsIn } from 'class-validator';
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
}

export class FeedbackRequestDto {
  @IsArray()
  transcript: Array<{ role: string; text: string }>;

  @IsString()
  topic: string;

  @IsString()
  level: string;

  @IsString()
  @IsOptional()
  language?: string;
}

export class TtsRequestDto {
  @IsString()
  text: string;
}



