import { Controller, Post, Get, Query, Body } from '@nestjs/common';
import { CollectorService } from '../collector/collector.service';
import { FeeClient } from '../collector/clients/fee.client';
import { UpbitClient } from '../collector/clients/upbit.client';
import { NewsService } from '../news/news.service';

@Controller('test')
export class TestController {
  constructor(
    private readonly collectorService: CollectorService,
    private readonly feeClient: FeeClient,
    private readonly upbitClient: UpbitClient,
    private readonly newsService: NewsService,
  ) {}

  @Post('collect/upbit-markets')
  async testCollectUpbitMarkets() {
    await this.collectorService.collectUpbitMarkets();
    return { message: 'Upbit markets collection completed' };
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

  @Post('collect/fees')
  async testCollectExchangeFees() {
    await this.collectorService.collectExchangeFees();
    return { message: 'Exchange fees collection completed' };
  }

  @Get('collect/fees')
  async getExchangeFees() {
    const upbitFees = await this.feeClient.getUpbitFees();
    const binanceFees = await this.feeClient.getBinanceFees();

    return {
      upbit: upbitFees,
      binance: binanceFees
    };
  }

  @Post('collect/minute-data')
  async testCollectMinuteData() {
    await this.collectorService.collectMinuteData();
    return { message: 'Minute data collection completed' };
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
        data: topCoins.map(coin => ({
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
    @Body() data: { 
      symbol: string,
      twitterData?: any,
      newsData?: any 
    }
  ) {
    try {
      const coinData = await this.upbitClient.getTopVolumeCoins(20);
      const coin = coinData.find(c => c.symbol === data.symbol);
      
      if (!coin) {
        throw new Error(`No data found for coin: ${data.symbol}`);
      }

      // 트위터와 뉴스 데이터가 제공되지 않은 경우 수집
      const twitterData = data.twitterData || await this.newsService.collectTwitterData(data.symbol);
      const newsData = data.newsData || await this.newsService.collectNewsData(data.symbol);

      const article = await this.newsService.generateArticle(coin, twitterData, newsData);
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
}
