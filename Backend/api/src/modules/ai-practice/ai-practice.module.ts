import { Module } from '@nestjs/common';
import { AIPracticeService } from './ai-practice.service';
import { AIPracticeController } from './ai-practice.controller';

@Module({
  controllers: [AIPracticeController],
  providers: [AIPracticeService],
  exports: [AIPracticeService],
})
export class AIPracticeModule {}

