import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
} from '@nestjs/common';
import { PredictService } from './predict.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { Logger } from '@nestjs/common';
import { JwtAdminAuthGuard } from '../admin/guards/jwt-auth.guard';

interface CreatePredictDto {
  market: string;
  exchange: 'upbit' | 'bithumb' | 'binance' | 'coinone';
  position: 'L' | 'S';
  duration: 15 | 30 | 60 | 180;
  leverage: 10 | 20 | 50 | 100;
  deposit: number;
}

@Controller('predict')
export class PredictController {
  private readonly logger = new Logger(PredictController.name);

  constructor(private readonly predictService: PredictService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async startPredict(
    @Body() createPredictDto: CreatePredictDto,
    @Req() req: Request & { user: { id: number } },
  ) {
    try {
      const { market, exchange, position, duration, leverage, deposit } =
        createPredictDto;
      const userId = req.user?.id;

      if (!userId) {
        this.logger.error('User ID not found in request', req.user);
        return {
          success: false,
          message: 'Authentication failed',
        };
      }

      const prediction = await this.predictService.createPredict(
        userId,
        market,
        exchange,
        position,
        duration,
        leverage,
        deposit,
      );

      return {
        success: true,
        data: prediction,
      };
    } catch (error) {
      this.logger.error('Failed to create prediction:', error);
      return {
        success: false,
        message: error.message || 'Failed to create prediction',
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getPredictStats(@Req() req: Request & { user: { id: number } }) {
    try {
      const stats = await this.predictService.getPredictStats(req.user.id);
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get('rankings')
  async getRankings() {
    try {
      const [mostVault, mostWins, bestWinRate] = await Promise.all([
        this.predictService.getMostVaultRanking(),
        this.predictService.getMostWinsRanking(),
        this.predictService.getBestWinRateRanking(),
      ]);

      return {
        success: true,
        data: {
          mostVault,
          mostWins,
          bestWinRate,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('logs')
  async getPredictLogs(
    @Req() req: Request & { user: { id: number } },
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    try {
      const logs = await this.predictService.getPredictLogs(
        req.user.id,
        parseInt(page),
        parseInt(limit),
      );

      return {
        success: true,
        data: logs,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('check-in')
  async checkIn(@Req() req: Request & { user: { id: number } }) {
    try {
      const result = await this.predictService.checkIn(req.user.id);

      return {
        success: true,
        data: {
          message: '출석 체크 완료! 보상이 지급되었습니다.',
          reward: result.reward,
          newBalance: result.newBalance,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @UseGuards(JwtAdminAuthGuard)
  @Get('admin/stats')
  async getAdminStats() {
    try {
      const stats = await this.predictService.getAdminPredictStats();
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
