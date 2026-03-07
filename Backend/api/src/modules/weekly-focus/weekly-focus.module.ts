import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeeklyFocus } from '../../entities/weekly-focus.entity';
import { LearningHistory } from '../../entities/learning-history.entity';
import { WeeklyFocusService } from './weekly-focus.service';
import { WeeklyFocusController } from './weekly-focus.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WeeklyFocus, LearningHistory])],
  controllers: [WeeklyFocusController],
  providers: [WeeklyFocusService],
  exports: [WeeklyFocusService],
})
export class WeeklyFocusModule {}
