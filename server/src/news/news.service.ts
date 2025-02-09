import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { UpbitClient } from '../collector/clients/upbit.client';
import { OpenAIClient } from './clients/openai.client';
import { WebSearchClient } from './clients/web-search.client';
import { TwitterClient } from './clients/twitter.client';
import { NewsRepository } from './news.repository';
import { NewsQueryOptions } from './types/news.types';
import { RedisService } from '../redis/redis.service';
@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  // 3. 두번째 문단: 트위터 사용자들의 주요 의견과 시장 반응 분석
  private readonly newsPrompt = `
당신은 암호화폐 시장 분석가입니다. 제공된 정보를 바탕으로 전문적인 뉴스 기사를 작성해주세요.

다음 구조로 기사를 작성해주세요:

1. 제목: 코인의 현재 상황을 잘 반영한 흥미로운 제목 (80자 이내)
2. 첫 문단: 거래량과 가격 변동에 대한 객관적 데이터 설명
3. 두번째 문단: 관련 뉴스 기사들의 핵심 내용 요약
4. 세번째 문단: 전반적인 시장 영향과 향후 전망

응답 형식은 JSON으로 변형할 수 있도록 반드시 다음과 같이 출력해주세요:
{
  "title": \`뉴스 제목\`,
  "content": \`뉴스 본문\`
}

기사는 객관적이고 전문적인 톤을 유지하되, 이해하기 쉽게 작성해주세요.
각 정보의 출처를 명확히 포함시켜주세요.
`;

  constructor(
    private readonly configService: ConfigService,
    private readonly upbitClient: UpbitClient,
    private readonly openAIClient: OpenAIClient,
    private readonly webSearchClient: WebSearchClient,
    private readonly twitterClient: TwitterClient,
    private readonly newsRepository: NewsRepository,
    private readonly redisService: RedisService,
  ) {}

  @Cron('0 */3 * * *') // 3시간마다 실행
  async generateNews() {
    try {
      this.logger.debug('Starting news generation process...');

      // 1. 업비트 상위 10개 거래량 코인 조회
      const topCoins = await this.upbitClient.getTopVolumeCoins(10);

      // 코인별로 1분 간격으로 처리
      for (let i = 0; i < topCoins.length; i++) {
        const coin = topCoins[i];

        // 1분 대기 (첫 번째 코인은 제외)
        if (i > 0) {
          this.logger.debug(
            `Waiting 1 minute before processing ${coin.symbol}...`,
          );
          await new Promise((resolve) => setTimeout(resolve, 1 * 60 * 1000));
        }

        try {
          // 2. 각 코인에 대한 데이터 수집
          // 트위터는 월별 한도가 매우 낮아 유료 api 적용 이후 사용이 가능
          // const [twitterData, newsData] = await Promise.all([
          //   this.twitterClient.searchTweets(coin.symbol),
          //   this.webSearchClient.searchNews(coin.symbol),
          // ]);

          const twitterData = [];
          const newsData = await this.webSearchClient.searchNews(coin.symbol);

          // 3. 수집된 데이터를 기반으로 LLM에 분석 요청
          const analysisPrompt = this.createAnalysisPrompt(
            coin,
            twitterData,
            newsData,
          );
          const { title, content } = await this.openAIClient.generateArticle(
            this.newsPrompt,
            analysisPrompt,
          );

          // 4. 생성된 뉴스 저장
          await this.newsRepository.saveNews({
            symbol: coin.symbol,
            title: title,
            content: content,
            timestamp: new Date(),
            marketData: {
              volume: coin.volume,
              priceChange: coin.priceChange,
              currentPrice: coin.currentPrice,
            },
          });

          this.logger.debug(`Generated news for ${coin.symbol}`);
        } catch (error) {
          this.logger.error(
            `Failed to generate news for ${coin.symbol}`,
            error,
          );
          // 개별 코인 처리 실패 시에도 계속 진행
          continue;
        }
      }

      this.logger.debug('Completed news generation process');
    } catch (error) {
      this.logger.error('Failed to generate news', error);
    }
  }

  async generateNewsForCoin(symbol: string) {
    try {
      this.logger.debug(`Generating news for ${symbol}...`);

      // 코인 정보 조회
      const coinData = await this.upbitClient.getTopVolumeCoins(20);
      const coin = coinData.find((c) => c.symbol === symbol);

      if (!coin) {
        throw new Error(`No data found for coin: ${symbol}`);
      }

      // 1. 소셜 데이터 수집
      // const twitterData = await this.collectTwitterData(symbol);
      const twitterData = [];

      // 2. 뉴스 데이터 수집
      const newsData = await this.collectNewsData(symbol);

      // 3. LLM 분석 및 기사 생성
      const { title, content } = await this.generateArticle(
        coin,
        twitterData,
        newsData,
      );

      // 4. 저장
      const savedNews = await this.newsRepository.saveNews({
        title,
        symbol: coin.symbol,
        content,
        timestamp: new Date(),
        marketData: {
          volume: coin.volume,
          priceChange: coin.priceChange,
          currentPrice: coin.currentPrice,
        },
      });

      return savedNews;
    } catch (error) {
      this.logger.error(`Failed to generate news for ${symbol}`, error);
      throw error;
    }
  }

  async collectTwitterData(symbol: string) {
    try {
      this.logger.debug(`Collecting Twitter data for ${symbol}...`);
      const twitterData = await this.twitterClient.searchTweets(symbol);
      return twitterData;
    } catch (error) {
      this.logger.error(`Failed to collect Twitter data for ${symbol}`, error);
      throw error;
    }
  }

  async collectNewsData(symbol: string) {
    try {
      this.logger.debug(`Collecting news data for ${symbol}...`);
      const newsData = await this.webSearchClient.searchNews(symbol);
      return newsData;
    } catch (error) {
      this.logger.error(`Failed to collect news data for ${symbol}`, error);
      throw error;
    }
  }

  async generateArticle(coin: any, twitterData: any, newsData: any) {
    try {
      this.logger.debug(`Generating article for ${coin.symbol}...`);
      const analysisPrompt = this.createAnalysisPrompt(
        coin,
        twitterData,
        newsData,
      );
      const { title, content } = await this.openAIClient.generateArticle(
        this.newsPrompt,
        analysisPrompt,
      );

      return { title, content };
    } catch (error) {
      this.logger.error(`Failed to generate article for ${coin.symbol}`, error);
      throw error;
    }
  }

  private createAnalysisPrompt(
    coin: any,
    twitterData: any,
    newsData: any,
  ): string {
    // 트위터 유료 api 적용 후에 내용 추가가 필요
    // 트위터 반응:
    // ${JSON.stringify(twitterData, null, 2)}
    return `
코인 정보:
심볼: ${coin.symbol}
현재 가격: ${coin.currentPrice}
24시간 거래량: ${coin.volume}
가격 변동률: ${coin.priceChange}%

관련 뉴스:
${JSON.stringify(newsData, null, 2)}

위 정보를 바탕으로 전문적인 시장 분석 기사를 작성해주세요.
`;
  }

  async getNews(options: NewsQueryOptions) {
    try {
      const cacheKey = `news:${options.symbol || 'all'}:${options.limit}:${options.offset}`;
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const news = await this.newsRepository.findNews({
        ...options,
        orderBy: { timestamp: 'desc' },
      });

      const response = {
        success: true,
        data: news,
        pagination: {
          limit: options.limit,
          page: Math.floor(options.offset / options.limit) + 1,
        },
      };

      await this.redisService.set(cacheKey, JSON.stringify(response), 3600);

      return response;
    } catch (error) {
      this.logger.error('Failed to fetch news', error);
      throw error;
    }
  }

  async getRecentNews(options: NewsQueryOptions) {
    try {
      // Create a cache key based on the options
      const cacheKey = `recent-news:${options.symbol || 'all'}:${options.limit}:${options.offset}`;

      // Try to get cached data
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      // If no cached data, fetch from database
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const news = await this.newsRepository.findNews({
        ...options,
        orderBy: { timestamp: 'desc' },
        where: {
          timestamp: { gte: oneDayAgo },
          ...(options.symbol ? { symbol: options.symbol } : {}),
        },
      });

      const response = {
        success: true,
        data: news,
        pagination: {
          limit: options.limit,
          page: Math.floor(options.offset / options.limit) + 1,
        },
      };

      // Cache the response for 1 hour (3600 seconds)
      await this.redisService.set(cacheKey, JSON.stringify(response), 3600);

      return response;
    } catch (error) {
      this.logger.error('Failed to fetch recent news', error);
      throw error;
    }
  }

  async readNews(id: string) {
    try {
      const newsRedisKey = `news-one:${id}`;
      const cachedNews = await this.redisService.get(newsRedisKey);
      if (cachedNews) {
        return {
          success: true,
          data: JSON.parse(cachedNews),
        };
      }

      const news = await this.newsRepository.findNewsById(id);
      await this.redisService.set(
        newsRedisKey,
        JSON.stringify(news),
        3600 * 24,
      );
      return {
        success: true,
        data: news,
      };
    } catch (error) {
      this.logger.error('Failed to read news', error);
      throw error;
    }
  }
}
