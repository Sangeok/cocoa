import { Controller, Post, Get, Query, Body } from '@nestjs/common';
import { CollectorService } from '../collector/collector.service';
import { FeeClient } from '../collector/clients/fee.client';
import { UpbitClient } from '../collector/clients/upbit.client';
import { NewsService } from '../news/news.service';
import { RedisService } from '../redis/redis.service';
import { Logger } from '@nestjs/common';

@Controller('test')
export class TestController {
  private readonly logger = new Logger(TestController.name);

  constructor(
    private readonly collectorService: CollectorService,
    private readonly feeClient: FeeClient,
    private readonly upbitClient: UpbitClient,
    private readonly newsService: NewsService,
    private readonly redisService: RedisService,
  ) {}

  @Post('collect/markets')
  async testCollectMarkets() {
    await this.collectorService.collectMarkets();
    return { message: 'Markets collection completed' };
  }

  @Post('collect/exchange-rate')
  async testCollectExchangeRate() {
    await this.collectorService.collectExchangeRate();
    return { message: 'Exchange rate collection completed' };
  }

  @Post('collect/exchange-rate-history')
  async testStoreExchangeRateHistory() {
    await this.collectorService.storeExchangeRateHistory();
    return { message: 'Exchange rate history stored' };
  }

  @Get('collect/fees')
  async getExchangeFees() {
    const upbitFees = await this.feeClient.getUpbitFees();
    const binanceFees = await this.feeClient.getBinanceFees();
    const coinoneFees = await this.feeClient.getCoinoneFees();

    return {
      upbit: upbitFees,
      binance: binanceFees,
      coinone: coinoneFees,
    };
  }

  @Post('collect/hour-data')
  async testCollectHourData() {
    await this.collectorService.collectHourData();
    return { message: 'Hour data collection completed' };
  }

  @Post('collect/daily-data')
  async testCollectDailyData() {
    await this.collectorService.collectDailyData();
    return { message: 'Daily data collection completed' };
  }

  @Get('top-coins')
  async getTopCoins(@Query('limit') limit = '10') {
    try {
      const topCoins = await this.upbitClient.getTopVolumeCoins(Number(limit));
      return {
        success: true,
        data: topCoins.map((coin) => ({
          ...coin,
          volume: Number(coin.volume.toFixed(0)), // 거래량을 정수로 표시
          priceChange: Number(coin.priceChange.toFixed(2)), // 변동률을 소수점 2자리까지 표시
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('generate-news')
  async generateNewsForCoin(@Body('symbol') symbol: string) {
    try {
      const news = await this.newsService.generateNewsForCoin(symbol);
      return {
        success: true,
        data: news,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('twitter-data')
  async getTwitterData(@Query('symbol') symbol: string) {
    try {
      const twitterData = await this.newsService.collectTwitterData(symbol);
      return {
        success: true,
        data: twitterData,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('news-data')
  async getNewsData(@Query('symbol') symbol: string) {
    try {
      const newsData = await this.newsService.collectNewsData(symbol);
      return {
        success: true,
        data: newsData,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('generate-article')
  async generateArticle(
    @Body() data: { symbol: string; twitterData?: any; newsData?: any },
  ) {
    try {
      const coinData = await this.upbitClient.getTopVolumeCoins(20);
      const coin = coinData.find((c) => c.symbol === data.symbol);

      if (!coin) {
        throw new Error(`No data found for coin: ${data.symbol}`);
      }

      // 트위터와 뉴스 데이터가 제공되지 않은 경우 수집
      // const twitterData = data.twitterData || await this.newsService.collectTwitterData(data.symbol);
      const twitterData = [];
      const newsData =
        data.newsData || (await this.newsService.collectNewsData(data.symbol));

      const article = await this.newsService.generateArticle(
        coin,
        twitterData,
        newsData,
      );
      return {
        success: true,
        data: article,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('tickers')
  async getTickers(@Query('exchange') exchange?: string) {
    try {
      let pattern = 'ticker-*';
      if (exchange) {
        pattern = `ticker-${exchange}-*`;
      }

      // 디버깅을 위한 로그 추가
      this.logger.debug(`Searching for pattern: ${pattern}`);

      const keys = await this.redisService.getKeys(pattern);
      this.logger.debug(`Found keys: ${keys.join(', ')}`);

      const tickers = await Promise.all(
        keys.map(async (key) => {
          const data = await this.redisService.get(key);
          return {
            symbol: key.replace('ticker-', '').replace(`${exchange}-`, ''),
            data: JSON.parse(data || '{}'),
          };
        }),
      );

      return {
        success: true,
        data: tickers,
      };
    } catch (error) {
      this.logger.error('Failed to get tickers:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('redis-debug')
  async debugRedis() {
    try {
      // 1. 전체 키 확인
      const allKeys = await this.redisService.getKeys('*');
      this.logger.debug(`All keys in Redis: ${allKeys.join(', ')}`);

      // 2. 바이낸스 키만 확인
      const binanceKeys = await this.redisService.getKeys('ticker-binance-*');
      this.logger.debug(`Binance keys: ${binanceKeys.join(', ')}`);

      // 3. 각 키의 실제 값 확인
      const keyValues = await Promise.all(
        binanceKeys.map(async (key) => {
          const value = await this.redisService.get(key);
          return { key, value };
        }),
      );

      return {
        totalKeys: allKeys.length,
        binanceKeys: binanceKeys.length,
        keyValues,
      };
    } catch (error) {
      this.logger.error('Redis debug failed:', error);
      return { error: error.message };
    }
  }

  @Post('redis/flush-all')
  async flushAllRedis() {
    try {
      await this.redisService.flushAll();
      return {
        success: true,
        message: 'All Redis data has been cleared',
      };
    } catch (error) {
      this.logger.error('Failed to flush Redis:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('redis/flush')
  async flushExchangeData(@Body() data: { exchange: string }) {
    try {
      const keys = await this.redisService.getKeys(`ticker-${data.exchange}-*`);
      if (keys.length > 0) {
        await this.redisService.del(...keys);
      }
      return {
        success: true,
        message: `Cleared ${keys.length} ${data.exchange} ticker keys`,
      };
    } catch (error) {
      this.logger.error(`Failed to flush ${data.exchange} data:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('generate-strategy')
  async generateTradingStrategy() {
    try {
      await this.newsService.generateTradingStrategy();
      return {
        success: true,
        message: 'Trading strategy generated successfully',
      };
    } catch (error) {
      this.logger.error('Failed to generate trading strategy:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('strategy')
  async getLatestStrategy() {
    try {
      const news = await this.newsService.getNews({
        type: 'STRATEGY',
        limit: 1,
        offset: 0,
      });
      
      return {
        success: true,
        data: news.data[0], // 가장 최근 전략 리포트 반환
      };
    } catch (error) {
      this.logger.error('Failed to get latest strategy:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
