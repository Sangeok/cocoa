import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DrizzleClient } from '../database/database.module';
import { yields } from '../database/schema/yield';
import { RedisService } from '../redis/redis.service';
import axios from 'axios';
import { sql } from 'drizzle-orm';
import { SortField, SortOrder } from './yield.controller';

interface YieldResponse {
  status: string;
  data: YieldData[];
}

interface YieldData {
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apyBase: number | null;
  apyReward: number | null;
  apy: number | null;
  rewardTokens: string[] | null;
  pool: string;
  apyPct1D: number | null;
  apyPct7D: number | null;
  apyPct30D: number | null;
  stablecoin: boolean;
  ilRisk: string | null;
  exposure: string | null;
  predictions: {
    predictedClass: string | null;
    predictedProbability: number | null;
    binnedConfidence: number | null;
  } | null;
  poolMeta: string | null;
  mu: number | null;
  sigma: number | null;
  count: number | null;
  outlier: boolean;
  underlyingTokens: string[] | null;
  il7d: number | null;
  apyBase7d: number | null;
  apyMean30d: number | null;
  volumeUsd1d: number | null;
  volumeUsd7d: number | null;
  apyBaseInception: number | null;
}

// DB에서 가져온 데이터의 타입을 정의
interface DBYield {
  id: string;
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: string;
  apyBase: string | null;
  apyReward: string | null;
  apy: string | null;
  rewardTokens: string[] | null;
  pool: string;
  apyPct1D: string | null;
  apyPct7D: string | null;
  apyPct30D: string | null;
  stablecoin: boolean;
  ilRisk: string | null;
  exposure: string | null;
  predictedClass: string | null;
  predictedProbability: string | null;
  binnedConfidence: string | null;
  poolMeta: string | null;
  mu: string | null;
  sigma: string | null;
  count: string | null;
  outlier: boolean;
  underlyingTokens: string[] | null;
  il7d: string | null;
  apyBase7d: string | null;
  apyMean30d: string | null;
  volumeUsd1d: string | null;
  volumeUsd7d: string | null;
  apyBaseInception: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PaginatedYields {
  data: DBYield[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface ProjectSummary {
  project: string;
  chains: string[];
  symbols: string[];
  totalTvl: number;
  avgApy: number;
  yields: DBYield[];
}

const YIELDS_CACHE_KEY = 'yields:all';
const CHUNK_SIZE = 500; // 한 번에 처리할 데이터 크기

@Injectable()
export class YieldService {
  private readonly logger = new Logger(YieldService.name);

  constructor(
    @Inject('DATABASE') private readonly db: typeof DrizzleClient,
    private readonly redisService: RedisService,
  ) {}

  private calculateTTLUntil6AM(): number {
    const now = new Date();
    const target = new Date(now);
    target.setHours(6, 0, 0, 0);

    if (now.getHours() >= 6) {
      target.setDate(target.getDate() + 1);
    }

    return Math.floor((target.getTime() - now.getTime()) / 1000);
  }

  private getSortColumn(sortBy: SortField) {
    const sortColumns = {
      tvl: 'tvl_usd',
      apy: 'apy',
      daily: 'apy_pct_1d',
      weekly: 'apy_pct_7d',
    };
    return sortColumns[sortBy];
  }

  async getYields(
    page: number, 
    size: number, 
    sortBy: SortField, 
    order: SortOrder,
    search?: string
  ): Promise<PaginatedYields> {
    const offset = (page - 1) * size;
    const sortColumn = this.getSortColumn(sortBy);
    
    // 기본 쿼리 생성
    const baseQuery = this.db.select().from(yields);
    
    // 검색 조건 적용
    const filteredQuery = search 
      ? baseQuery.where(
          sql`LOWER(project) LIKE ${`%${search.toLowerCase()}%`} OR 
              LOWER(chain) LIKE ${`%${search.toLowerCase()}%`} OR 
              LOWER(symbol) LIKE ${`%${search.toLowerCase()}%`}`
        )
      : baseQuery;

    // 데이터와 총 개수를 동시에 조회
    const [data, countResult] = await Promise.all([
      filteredQuery
        .limit(size)
        .offset(offset)
        .orderBy(
          order === 'desc' 
            ? sql`CAST(${sql.raw(sortColumn)} AS NUMERIC) DESC NULLS LAST`
            : sql`CAST(${sql.raw(sortColumn)} AS NUMERIC) ASC NULLS LAST`
        ),
      this.db
        .select({ count: sql`count(*)::int` })
        .from(yields)
        .where(
          search 
            ? sql`LOWER(project) LIKE ${`%${search.toLowerCase()}%`} OR 
                LOWER(chain) LIKE ${`%${search.toLowerCase()}%`} OR 
                LOWER(symbol) LIKE ${`%${search.toLowerCase()}%`}`
            : undefined
        )
    ]);

    const total = Number(countResult[0].count);
    const totalPages = Math.ceil(total / size);

    return {
      data: data as DBYield[],
      total,
      page,
      size,
      totalPages,
    };
  }

  private async processChunk(tx: any, chunk: any[]) {
    try {
      await tx.insert(yields).values(chunk);
    } catch (error) {
      this.logger.error(`Error processing chunk: ${error.message}`);
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM, {
    timeZone: 'Asia/Seoul',
  })
  async fetchAndSaveYields() {
    try {
      this.logger.log('Fetching yields data...');

      const response = await axios.get<YieldResponse>(
        'https://yields.llama.fi/pools',
      );

      if (response.data.status !== 'success') {
        throw new Error('Failed to fetch yields data');
      }

      const yields_data = response.data.data.map((item) => ({
        chain: item.chain,
        project: item.project,
        symbol: item.symbol,
        tvlUsd: String(item.tvlUsd),
        apyBase: item.apyBase?.toString() || null,
        apyReward: item.apyReward?.toString() || null,
        apy: item.apy?.toString() || null,
        rewardTokens: item.rewardTokens,
        pool: item.pool,
        apyPct1D: item.apyPct1D?.toString() || null,
        apyPct7D: item.apyPct7D?.toString() || null,
        apyPct30D: item.apyPct30D?.toString() || null,
        stablecoin: item.stablecoin,
        ilRisk: item.ilRisk,
        exposure: item.exposure,
        predictedClass: item.predictions?.predictedClass,
        predictedProbability:
          item.predictions?.predictedProbability?.toString() || null,
        binnedConfidence:
          item.predictions?.binnedConfidence?.toString() || null,
        poolMeta: item.poolMeta,
        mu: item.mu?.toString() || null,
        sigma: item.sigma?.toString() || null,
        count: item.count?.toString() || null,
        outlier: item.outlier,
        underlyingTokens: item.underlyingTokens,
        il7d: item.il7d?.toString() || null,
        apyBase7d: item.apyBase7d?.toString() || null,
        apyMean30d: item.apyMean30d?.toString() || null,
        volumeUsd1d: item.volumeUsd1d?.toString() || null,
        volumeUsd7d: item.volumeUsd7d?.toString() || null,
        apyBaseInception: item.apyBaseInception?.toString() || null,
      }));

      // Process data in chunks
      await this.db.transaction(async (tx) => {
        // Clear existing data
        await tx.execute(sql`TRUNCATE TABLE ${yields}`);

        // Process in chunks
        for (let i = 0; i < yields_data.length; i += CHUNK_SIZE) {
          const chunk = yields_data.slice(i, i + CHUNK_SIZE);
          await this.processChunk(tx, chunk);
          this.logger.log(
            `Processed chunk ${i / CHUNK_SIZE + 1} of ${Math.ceil(yields_data.length / CHUNK_SIZE)}`,
          );
        }
      });

      // Update Redis cache after successful DB update
      await this.redisService.set(
        YIELDS_CACHE_KEY,
        JSON.stringify(yields_data),
        this.calculateTTLUntil6AM(),
      );

      this.logger.log(
        `Successfully updated ${yields_data.length} yield records`,
      );
    } catch (error) {
      this.logger.error('Error fetching and saving yields:', error);
      throw error;
    }
  }

  async getProjectYields(projectName: string): Promise<ProjectSummary> {
    const projectYields = await this.db
      .select()
      .from(yields)
      .where(sql`LOWER(project) = ${projectName.toLowerCase()}`);

    if (!projectYields.length) {
      throw new Error('Project not found');
    }

    const chains = [...new Set(projectYields.map(y => y.chain))];
    const symbols = [...new Set(projectYields.map(y => y.symbol))];
    const totalTvl = projectYields.reduce((sum, y) => sum + Number(y.tvlUsd), 0);
    
    // Calculate average APY excluding null values
    const validApys = projectYields
      .map(y => Number(y.apy))
      .filter(apy => !isNaN(apy) && apy !== null);
    const avgApy = validApys.length 
      ? validApys.reduce((sum, apy) => sum + apy, 0) / validApys.length
      : 0;

    return {
      project: projectName,
      chains,
      symbols,
      totalTvl,
      avgApy,
      yields: projectYields as DBYield[],
    };
  }
}
