import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIPracticeService } from './ai-practice.service';
import { AIPracticeController } from './ai-practice.controller';
import { WeeklyFocus } from '../../entities/weekly-focus.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WeeklyFocus])],
  controllers: [AIPracticeController],
  providers: [AIPracticeService],
  exports: [AIPracticeService],
})
export class AIPracticeModule {}

