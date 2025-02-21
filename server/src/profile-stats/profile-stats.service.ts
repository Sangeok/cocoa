import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DrizzleClient } from '../database/database.module';
import { profileStats } from '../database/schema/profile-stats';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class ProfileStatsService {
  constructor(@Inject('DATABASE') private readonly db: typeof DrizzleClient) {}

  async recordVisit(userId: number) {
    try {
      const now = new Date();
      const koreanTime = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9

      // 한국 시간 기준으로 오늘 자정 계산
      const todayStart = new Date(
        koreanTime.getFullYear(),
        koreanTime.getMonth(),
        koreanTime.getDate(),
      );

      // 기존 통계 조회
      const stats = await this.db
        .select()
        .from(profileStats)
        .where(eq(profileStats.userId, userId))
        .limit(1);

      try {
        if (stats.length === 0) {
          // 첫 방문인 경우 새로운 레코드 생성
          const [newStats] = await this.db
            .insert(profileStats)
            .values({
              userId,
              totalVisits: 1,
              todayVisits: 1,
              lastResetAt: todayStart,
            })
            .returning();
          return newStats;
        }

        const currentStats = stats[0];
        const lastReset = new Date(currentStats.lastResetAt);

        // 마지막 리셋 시간이 오늘 자정보다 이전이면 일일 방문자 수 리셋
        if (lastReset < todayStart) {
          const [updatedStats] = await this.db
            .update(profileStats)
            .set({
              totalVisits: sql`${profileStats.totalVisits} + 1`,
              todayVisits: 1,
              lastResetAt: todayStart,
            })
            .where(eq(profileStats.userId, userId))
            .returning();
          return updatedStats;
        }

        // 오늘 내의 방문이면 카운트만 증가
        const [updatedStats] = await this.db
          .update(profileStats)
          .set({
            totalVisits: sql`${profileStats.totalVisits} + 1`,
            todayVisits: sql`${profileStats.todayVisits} + 1`,
          })
          .where(eq(profileStats.userId, userId))
          .returning();
        return updatedStats;
      } catch (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Database operation failed: ${dbError.message}`);
      }
    } catch (error) {
      console.error('Error in recordVisit:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to record visit: ${error.message}`);
    }
  }

  async getStats(userId: number) {
    const stats = await this.db
      .select()
      .from(profileStats)
      .where(eq(profileStats.userId, userId))
      .limit(1);

    if (stats.length === 0) {
      return {
        totalVisits: 0,
        todayVisits: 0,
      };
    }

    return {
      totalVisits: stats[0].totalVisits,
      todayVisits: stats[0].todayVisits,
    };
  }
}
