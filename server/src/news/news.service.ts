import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { DrizzleClient } from '../database/database.module';
import { UpbitClient } from '../collector/clients/upbit.client';
import { OpenAIClient } from './clients/openai.client';
import { WebSearchClient } from './clients/web-search.client';
import { TwitterClient } from './clients/twitter.client';
import { NewsRepository } from './news.repository';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  private readonly newsPrompt = `
당신은 암호화폐 시장 분석가입니다. 제공된 정보를 바탕으로 전문적인 뉴스 기사를 작성해주세요.

다음 구조로 기사를 작성해주세요:

1. 제목: 코인의 현재 상황을 잘 반영한 흥미로운 제목
2. 첫 문단: 거래량과 가격 변동에 대한 객관적 데이터 설명
3. 두번째 문단: 트위터 사용자들의 주요 의견과 시장 반응 분석
4. 세번째 문단: 관련 뉴스 기사들의 핵심 내용 요약
5. 마지막 문단: 전반적인 시장 영향과 향후 전망

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
  ) {}

  @Cron('0 */6 * * *') // 6시간마다 실행
  async generateNews() {
    try {
      this.logger.debug('Starting news generation process...');
      
      // 1. 업비트 상위 10개 거래량 코인 조회
      const topCoins = await this.upbitClient.getTopVolumeCoins(10);
      
      for (const coin of topCoins) {
        // 2. 각 코인에 대한 데이터 수집
        const [twitterData, newsData] = await Promise.all([
          this.twitterClient.searchTweets(coin.symbol),
          this.webSearchClient.searchNews(coin.symbol)
        ]);
        
        // 3. 수집된 데이터를 기반으로 LLM에 분석 요청
        const analysisPrompt = this.createAnalysisPrompt(
          coin,
          twitterData,
          newsData
        );
        
        const article = await this.openAIClient.generateArticle(
          this.newsPrompt,
          analysisPrompt
        );
        
        // 4. 생성된 뉴스 저장
        await this.newsRepository.saveNews({
          symbol: coin.symbol,
          content: article,
          timestamp: new Date(),
          marketData: {
            volume: coin.volume,
            priceChange: coin.priceChange,
            currentPrice: coin.currentPrice
          }
        });
        
        this.logger.debug(`Generated news for ${coin.symbol}`);
      }
      
      this.logger.debug('Completed news generation process');
    } catch (error) {
      this.logger.error('Failed to generate news', error);
    }
  }

  private createAnalysisPrompt(coin: any, twitterData: any, newsData: any): string {
    return `
코인 정보:
심볼: ${coin.symbol}
현재 가격: ${coin.currentPrice}
24시간 거래량: ${coin.volume}
가격 변동률: ${coin.priceChange}%

트위터 반응:
${JSON.stringify(twitterData, null, 2)}

관련 뉴스:
${JSON.stringify(newsData, null, 2)}

위 정보를 바탕으로 전문적인 시장 분석 기사를 작성해주세요.
`;
  }
} 