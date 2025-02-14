import { Injectable, Logger, Inject } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { DrizzleClient } from '../database/database.module';
import { predicts } from '../database/schema/predict';
import { eq, sql, desc } from 'drizzle-orm';
import { AppGateway } from '../gateway/app.gateway';
import { users } from '../database/schema/user';
import { predictLogs } from '../database/schema/predict-log';
import { NewPredictLog } from '../database/schema/predict-log';

export interface PredictData {
  market: string;
  exchange: 'upbit' | 'bithumb' | 'binance' | 'coinone';
  createdAt: number;
  price: number;
  position: 'L' | 'S';
  finishedAt: number;
  deposit: number;
  leverage: number;
}

export interface PredictResult {
  isWin: boolean;
  isDraw: boolean;
  isLiquidated: boolean;
  market: string;
  entryPrice: number;
  closePrice: number;
  position: 'L' | 'S';
  leverage: number;
  deposit: number;
  vault: number;
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
    duration: 15 | 30 | 60 | 180, // seconds
    leverage: number = 20,
    deposit: number = 100,
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
        deposit,
        leverage,
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

      // Check user's vault balance
      const userPredict = await this.db
        .select()
        .from(predicts)
        .where(eq(predicts.userId, userId))
        .limit(1);

      if (!userPredict[0] || Number(userPredict[0].vault) < deposit) {
        throw new Error('Insufficient vault balance');
      }

      // Deduct deposit from vault
      await this.db
        .update(predicts)
        .set({
          vault: sql`${predicts.vault} - ${deposit}`,
          lastPredictAt: new Date(),
        })
        .where(eq(predicts.userId, userId));

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
        const userId = parseInt(key.split('-')[1]);
        const currentPrice =
          premiumData[predict.market]?.[predict.exchange]?.price;

        if (!currentPrice) continue;

        // 청산 조건 체크
        const priceChange = currentPrice - predict.price;
        const priceChangePercent = (priceChange / predict.price) * 100;
        const leveragedReturn = priceChangePercent * predict.leverage;
        const isLiquidated =
          (predict.position === 'L' && leveragedReturn <= -100) || // 롱 포지션 청산
          (predict.position === 'S' && leveragedReturn >= 100); // 숏 포지션 청산

        if (isLiquidated || Date.now() >= predict.finishedAt) {
          const pnl =
            predict.position === 'L' ? leveragedReturn : -leveragedReturn;
          const profit = isLiquidated
            ? -predict.deposit
            : (predict.deposit * pnl) / 100;
          const vaultUpdate = isLiquidated ? 0 : profit + predict.deposit;

          // 청산 또는 정상 종료에 따른 결과 결정
          const isWin =
            !isLiquidated &&
            ((predict.position === 'L' && priceChange > 0) ||
              (predict.position === 'S' && priceChange < 0));

          // Log the prediction
          await this.db.insert(predictLogs).values({
            userId,
            market: predict.market,
            exchange: predict.exchange,
            entryPrice: `${predict.price}`,
            closePrice: currentPrice,
            deposit: `${predict.deposit}`,
            position: predict.position,
            leverage: predict.leverage,
            entryAt: new Date(predict.createdAt),
            exitAt: new Date(),
          } satisfies NewPredictLog);

          // Update predicts table
          const result = await this.db
            .update(predicts)
            .set({
              ...(isLiquidated
                ? { losses: sql`${predicts.losses} + 1` }
                : priceChange === 0
                  ? { draws: sql`${predicts.draws} + 1` }
                  : isWin
                    ? { wins: sql`${predicts.wins} + 1` }
                    : { losses: sql`${predicts.losses} + 1` }),
              vault: sql`${predicts.vault} + ${vaultUpdate}`,
              lastPredictAt: new Date(),
            })
            .where(eq(predicts.userId, userId))
            .returning();

          const updatedVault = Number(result[0].vault);
          this.logger.debug(
            `Updated vault for user ${userId}: ${updatedVault}`,
          );

          await this.redisService.del(key);

          // Emit result with liquidation info
          this.appGateway.server.emit(`predict-result-${userId}`, {
            isWin,
            isDraw: !isLiquidated && priceChange === 0,
            isLiquidated,
            market: predict.market,
            entryPrice: predict.price,
            closePrice: currentPrice,
            position: predict.position,
            leverage: predict.leverage,
            deposit: predict.deposit,
            vault: updatedVault,
          } satisfies PredictResult);
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

  async getPredictLogs(userId: number, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.db
        .select()
        .from(predictLogs)
        .where(eq(predictLogs.userId, userId))
        .orderBy(desc(predictLogs.entryAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(predictLogs)
        .where(eq(predictLogs.userId, userId)),
    ]);

    return {
      logs,
      pagination: {
        total: total[0].count,
        page,
        limit,
        totalPages: Math.ceil(total[0].count / limit),
      },
    };
  }

  async checkIn(userId: number) {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    // 사용자의 마지막 출석 체크 정보 조회
    const userPredict = await this.db
      .select()
      .from(predicts)
      .where(eq(predicts.userId, userId))
      .limit(1);

    if (!userPredict[0]) {
      throw new Error('User predict record not found');
    }

    const lastCheckIn = userPredict[0].lastCheckInAt;

    // 오늘 이미 출석 체크했는지 확인
    if (lastCheckIn && lastCheckIn >= startOfDay) {
      throw new Error('이미 오늘 출석체크를 완료했습니다');
    }

    // 출석 체크 보상 지급 (1000 vault)
    const reward = 1000;

    // vault 업데이트 및 마지막 출석 시간 기록
    await this.db
      .update(predicts)
      .set({
        vault: sql`${predicts.vault} + ${reward}`,
        lastCheckInAt: now,
      })
      .where(eq(predicts.userId, userId));

    return {
      reward,
      newBalance: Number(userPredict[0].vault) + reward,
    };
  }

  async getMostVaultRanking() {
    return await this.db
      .select({
        userId: predicts.userId,
        name: users.name,
        vault: predicts.vault,
        wins: predicts.wins,
        losses: predicts.losses,
        draws: predicts.draws,
      })
      .from(predicts)
      .innerJoin(users, eq(predicts.userId, users.id))
      .orderBy(desc(predicts.vault))
      .limit(10);
  }
}
