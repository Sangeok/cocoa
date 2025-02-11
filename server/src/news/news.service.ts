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

  private readonly dailyCoinNewsPrompt = `
당신은 암호화폐 시장 분석가입니다. 제공된 정보를 바탕으로 전문적인 뉴스 기사를 작성해주세요.

다음 구조로 기사를 작성해주세요:

코인의 현재 상황을 잘 반영한 흥미로운 제목 (80자 이내, 제목 뒤에 <DIVIDER>를 반드시 추가해주세요.)
1. 첫 문단: 거래량과 가격 변동에 대한 객관적 데이터 설명
2. 두번째 문단: 관련 뉴스 기사들의 핵심 내용 요약
3. 세번째 문단: 전반적인 시장 영향과 향후 전망

기사는 객관적이고 전문적인 톤을 유지하되, 이해하기 쉽게 작성해주세요.
각 정보의 출처를 명확히 포함시켜주세요.
`;

  private readonly tradingStrategyPrompt = `
당신은 암호화폐 트레이딩 전략가입니다. 제공된 시장 데이터와 뉴스를 바탕으로 상세한 투자 전략 리포트를 작성해주세요.

다음 구조로 리포트를 작성해주세요:

현재 시장 상황을 반영한 전략적 제목 (80자 이내, 제목 뒤에 <DIVIDER>를 반드시 추가해주세요.)

1. 시장 개요 (2-3문단):
   - 주요 암호화폐 시장 동향
   - 글로벌 매크로 상황이 암호화폐 시장에 미치는 영향
   - 주요 섹터별 퍼포먼스 분석

2. 주목해야 할 코인 (3-4문단):
   - 상승 가능성이 높은 3-5개 코인 분석
   - 각 코인별 매수 진입 구간
   - 투자 근거 및 리스크 요인
   - 목표가 및 손절가 제시

3. 주의해야 할 코인 (2-3문단):
   - 위험 신호를 보이는 2-3개 코인
   - 각 코인별 위험 요인 분석
   - 보유자들을 위한 대응 전략

시장 개요, 기간별 투자 전략, 주목해야 할 코인, 주의해야 할 코인, 리스크관리 전략, 추천 코인은 <h2>로 감싸주세요.

리포트는 전문성과 객관성을 유지하되, 실제 투자자들이 실행할 수 있는 구체적인 전략을 제시해주세요.
모든 분석과 제안에는 명확한 근거를 포함시켜주세요.
투자 위험성에 대한 경고도 반드시 포함해주세요.
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

  @Cron('0 0 6,18 * * *') // 매일 오전 6시, 오후 6시에 실행
  async generateNews() {
    try {
      this.logger.debug('Starting news generation process...');

      // 1. 업비트 상위 3개 거래량 코인 조회
      const topCoins = await this.upbitClient.getTopVolumeCoins(3);

      // 코인별로 5분 간격으로 처리
      for (let i = 0; i < topCoins.length; i++) {
        const coin = topCoins[i];

        // 5분 대기 (첫 번째 코인은 제외)
        if (i > 0) {
          this.logger.debug(
            `Waiting 5 minute before processing ${coin.symbol}...`,
          );
          await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000));
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
            this.dailyCoinNewsPrompt,
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
            newsData: newsData,
            type: 'COIN',
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

  // @Cron('0 0 8 * * *') // 스크립트 테스트 중: 매일 오전 8시에 실행
  async generateTradingStrategy() {
    try {
      this.logger.debug('Starting trading strategy generation...');

      // 1. 상위 20개 거래량 코인 데이터 수집
      const topCoins = await this.upbitClient.getTopVolumeCoins(20);

      // 2. 전체 시장 관련 뉴스 수집
      const marketNews = await this.webSearchClient.searchNews(
        'cryptocurrency market',
      );

      // 3. 각 상위 코인별 뉴스 수집
      const coinsNews = await Promise.all(
        topCoins
          .slice(0, 5)
          .map((coin) => this.webSearchClient.searchNews(coin.symbol)),
      );

      // 4. 분석 프롬프트 생성
      const analysisPrompt = this.createTradingStrategyPrompt(
        topCoins,
        marketNews,
        coinsNews,
      );

      // 5. LLM을 통한 전략 리포트 생성
      const { title, content } = await this.openAIClient.generateArticle(
        this.tradingStrategyPrompt,
        analysisPrompt,
      );

      // 6. 생성된 리포트 저장
      await this.newsRepository.saveNews({
        symbol: 'MARKET',
        title,
        content,
        timestamp: new Date(),
        marketData: {
          volume: topCoins.reduce((sum, coin) => sum + coin.volume, 0),
          priceChange: topCoins[0].priceChange,
          currentPrice: 0,
        },
        newsData: marketNews,
        type: 'STRATEGY',
      });

      this.logger.debug('Completed trading strategy generation');
    } catch (error) {
      this.logger.error('Failed to generate trading strategy', error);
    }
  }

  private createTradingStrategyPrompt(
    coins: any[],
    marketNews: any[],
    coinsNews: any[],
  ): string {
    return `
시장 데이터:
거래량 상위 20개 코인 정보:
${JSON.stringify(coins, null, 2)}

글로벌 시장 뉴스:
${JSON.stringify(marketNews, null, 2)}

주요 코인별 뉴스:
${JSON.stringify(coinsNews, null, 2)}

위 정보를 바탕으로 상세한 투자 전략 리포트를 작성해주세요.
특히 다음 사항에 중점을 두어 작성해주세요:
1. 현재 시장의 주요 트렌드와 방향성
2. 단기/중기/장기 관점의 구체적인 투자 전략
3. 추천 코인과 그 이유 (기술적/펀더멘털 분석 포함)
4. 주의해야 할 코인과 위험 요인
5. 리스크 관리 방안
`;
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
        newsData: newsData,
        type: 'COIN',
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
        this.dailyCoinNewsPrompt,
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
