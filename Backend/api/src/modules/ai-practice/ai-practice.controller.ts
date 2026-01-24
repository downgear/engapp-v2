import { Controller, Post, Body, HttpException, HttpStatus, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AIPracticeService } from './ai-practice.service';
import { ChatRequestDto, FeedbackRequestDto, TtsRequestDto } from './dto/chat.dto';
import type { Response } from 'express';

type UploadedAudioFile = {
  buffer: Buffer;
  originalname?: string;
  mimetype?: string;
};

@Controller('ai-practice')
export class AIPracticeController {
  constructor(private readonly aiPracticeService: AIPracticeService) {}

  @Post('chat')
  async chat(@Body() dto: ChatRequestDto) {
    try {
      const response = await this.aiPracticeService.chatNonStream(dto);
      return { content: response };
    } catch (error) {
      console.error('AI Chat error:', error);
      throw error;
    }
  }

  @Post('feedback')
  async generateFeedback(@Body() dto: FeedbackRequestDto) {
    try {
      const feedback = await this.aiPracticeService.generateFeedback(dto);
      return { feedback };
    } catch (error) {
      console.error('Feedback generation error:', error);
      throw error;
    }
  }

  @Post('transcribe')
  @UseInterceptors(FileInterceptor('audio'))
  async transcribe(@UploadedFile() file?: UploadedAudioFile) {
    try {
      if (!file?.buffer) {
        throw new HttpException({ message: 'Audio file is required' }, HttpStatus.BAD_REQUEST);
      }

      return await this.aiPracticeService.transcribeAudio(
        file.buffer,
        file.originalname || 'audio.webm',
        file.mimetype,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Transcription error:', error);
      const message = error instanceof Error ? error.message : 'Failed to transcribe audio';
      throw new HttpException({ message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('tts')
  async tts(@Body() dto: TtsRequestDto, @Res() res: Response) {
    try {
      if (!dto?.text?.trim()) {
        throw new HttpException({ message: 'Text is required' }, HttpStatus.BAD_REQUEST);
      }

      const audio = await this.aiPracticeService.textToSpeech(dto.text);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', audio.length);
      res.status(HttpStatus.OK).send(audio);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('TTS error:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate speech';
      throw new HttpException({ message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

