import { Injectable, Logger, Inject } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { DrizzleClient } from '../database/database.module';
import { predicts } from '../database/schema/predict';
import { eq, sql, desc } from 'drizzle-orm';
import { AppGateway } from '../gateway/app.gateway';
import { users } from '../database/schema/user';

export interface PredictData {
  market: string;
  exchange: 'upbit' | 'bithumb' | 'binance' | 'coinone';
  createdAt: number;
  price: number;
  position: 'L' | 'S';
  finishedAt: number;
}

@Injectable()
export class PredictService {
  private readonly logger = new Logger(PredictService.name);

  constructor(
    private readonly redisService: RedisService,
    @Inject('DATABASE') private readonly db: typeof DrizzleClient,
    private readonly appGateway: AppGateway,
  ) {}

  async createPredict(
    userId: number,
    market: string,
    exchange: PredictData['exchange'],
    position: PredictData['position'],
    duration: 30 | 180, // seconds
  ) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const predictKey = `predict-${userId}`;

    try {
      // Check if user already has an active prediction
      const existingPredict = await this.redisService.get(predictKey);
      if (existingPredict) {
        throw new Error('현재 진행 중인 예측이 있습니다.');
      }

      // Get current price from Redis
      const tickerKey = `ticker-${exchange}-${market}`;
      const tickerData = await this.redisService.get(tickerKey);
      if (!tickerData) {
        throw new Error('Market price data not available');
      }

      const currentPrice = JSON.parse(tickerData).price;
      const now = Date.now();

      const predictData: PredictData = {
        market,
        exchange,
        createdAt: now,
        price: currentPrice,
        position,
        finishedAt: now + duration * 1000,
      };

      // Check if user already has a predict record
      const existingRecord = await this.db
        .select()
        .from(predicts)
        .where(eq(predicts.userId, userId));

      if (existingRecord.length > 0) {
        // Update existing record
        await this.db
          .update(predicts)
          .set({ lastPredictAt: new Date() })
          .where(eq(predicts.userId, userId));
      } else {
        // Insert new record
        await this.db.insert(predicts).values({
          userId,
          wins: 0,
          losses: 0,
          draws: 0,
          lastPredictAt: new Date(),
        });
      }

      // If database operations succeed, store prediction in Redis
      await this.redisService.set(
        predictKey,
        JSON.stringify(predictData),
        duration + 5, // Add 5 seconds buffer for processing
      );

      return predictData;
    } catch (error) {
      this.logger.error('Error in createPredict:', error);
      // Cleanup Redis key if it exists
      await this.redisService.del(predictKey);
      throw error;
    }
  }

  async closePredict(premiumData: any) {
    try {
      const predictKeys = await this.redisService.getKeys('predict-*');

      for (const key of predictKeys) {
        const predictData = await this.redisService.get(key);
        if (!predictData) continue;

        const predict: PredictData = JSON.parse(predictData);

        if (Date.now() >= predict.finishedAt) {
          const userId = parseInt(key.split('-')[1]);
          const currentPrice =
            premiumData[predict.market]?.[predict.exchange]?.price;

          if (!currentPrice) continue;

          const priceChange = currentPrice - predict.price;

          // 가격 변동이 없는 경우 처리
          if (priceChange === 0) {
            // Redis에서만 삭제하고 DB는 업데이트하지 않음
            await this.redisService.del(key);

            await this.db
              .update(predicts)
              .set({ draws: sql`${predicts.draws} + 1` })
              .where(eq(predicts.userId, userId));

            // 무승부 결과 전송
            this.appGateway.server.emit(`predict-result-${userId}`, {
              isDraw: true,
              market: predict.market,
              entryPrice: predict.price,
              closePrice: currentPrice,
              position: predict.position,
            });

            continue;
          }

          const isWin =
            (predict.position === 'L' && priceChange > 0) ||
            (predict.position === 'S' && priceChange < 0);

          // DB 업데이트 (가격 변동이 있는 경우만)
          await this.db
            .update(predicts)
            .set(
              isWin
                ? { wins: sql`${predicts.wins} + 1` }
                : { losses: sql`${predicts.losses} + 1` },
            )
            .where(eq(predicts.userId, userId));

          await this.redisService.del(key);

          this.appGateway.server.emit(`predict-result-${userId}`, {
            isWin,
            isDraw: false,
            market: predict.market,
            entryPrice: predict.price,
            closePrice: currentPrice,
            position: predict.position,
          });
        }
      }
    } catch (error) {
      this.logger.error('Error closing predictions:', error);
    }
  }

  async getPredictStats(userId: number) {
    const result = await this.db
      .select({
        wins: predicts.wins,
        losses: predicts.losses,
        draws: predicts.draws,
      })
      .from(predicts)
      .where(eq(predicts.userId, userId));

    return result[0] || { wins: 0, losses: 0, draws: 0 };
  }

  async getMostWinsRanking() {
    return await this.db
      .select({
        userId: predicts.userId,
        name: users.name,
        wins: predicts.wins,
        losses: predicts.losses,
        draws: predicts.draws,
      })
      .from(predicts)
      .innerJoin(users, eq(predicts.userId, users.id))
      .where(
        sql`(${predicts.wins} + ${predicts.losses} + ${predicts.draws}) > 0`,
      ) // 최소 1게임 이상
      .orderBy(desc(predicts.wins))
      .limit(10);
  }

  async getBestWinRateRanking() {
    return await this.db
      .select({
        userId: predicts.userId,
        name: users.name,
        wins: predicts.wins,
        losses: predicts.losses,
        draws: predicts.draws,
        winRate: sql`CAST(${predicts.wins} AS FLOAT) / NULLIF((${predicts.wins} + ${predicts.losses} + ${predicts.draws}), 0) * 100`,
      })
      .from(predicts)
      .innerJoin(users, eq(predicts.userId, users.id))
      .where(
        sql`(${predicts.wins} + ${predicts.losses} + ${predicts.draws}) >= 1`,
      ) // 최소 1게임 이상
      .orderBy(
        desc(
          sql`CAST(${predicts.wins} AS FLOAT) / NULLIF((${predicts.wins} + ${predicts.losses} + ${predicts.draws}), 0)`,
        ),
      )
      .limit(10);
  }
}
