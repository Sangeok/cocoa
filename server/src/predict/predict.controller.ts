import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { PredictService } from './predict.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { Logger } from '@nestjs/common';

interface CreatePredictDto {
  market: string;
  exchange: 'upbit' | 'bithumb' | 'binance' | 'coinone';
  position: 'L' | 'S';
  duration: 30 | 180;
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
      const { market, exchange, position, duration } = createPredictDto;
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
      const [mostWins, bestWinRate] = await Promise.all([
        this.predictService.getMostWinsRanking(),
        this.predictService.getBestWinRateRanking(),
      ]);

      return {
        success: true,
        data: {
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
}
