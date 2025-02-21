import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ProfileStatsService } from './profile-stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('profile-stats')
export class ProfileStatsController {
  constructor(private readonly profileStatsService: ProfileStatsService) {}

  @Get(':userId')
  async getStats(@Param('userId') userId: string) {
    return {
      success: true,
      data: await this.profileStatsService.getStats(parseInt(userId)),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':userId/visit')
  async recordVisit(
    @Param('userId') userId: string,
    @Req() req: Request & { user: { id: number } },
  ) {
    try {
      const targetUserId = parseInt(userId);
      if (isNaN(targetUserId)) {
        throw new Error('Invalid user ID');
      }

      // 자신의 프로필 방문은 카운트하지 않음
      if (req.user.id === targetUserId) {
        const stats = await this.profileStatsService.getStats(targetUserId);
        console.log('Own profile stats:', stats); // 자신의 프로필 통계 확인
        return {
          success: true,
          data: stats,
        };
      }

      const data = await this.profileStatsService.recordVisit(targetUserId);
      console.log('Visit recorded:', data); // 방문 기록 결과 확인
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Detailed error:', error); // 상세 에러 로깅
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  }
}
