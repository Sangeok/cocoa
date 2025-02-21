import { Module } from '@nestjs/common';
import { ProfileStatsService } from './profile-stats.service';
import { ProfileStatsController } from './profile-stats.controller';

@Module({
  controllers: [ProfileStatsController],
  providers: [ProfileStatsService],
  exports: [ProfileStatsService],
})
export class ProfileStatsModule {} 