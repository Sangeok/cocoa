import { Injectable, Logger } from '@nestjs/common';
import { UpbitClient } from '../clients/upbit.client';
import { createTickerKey, parseUpbitMarket } from '../types/common.types';

@Injectable()
export class MarketCodesService {
  private readonly logger = new Logger(MarketCodesService.name);
  private marketCodes: string[] = [];
  private marketPairs: { baseToken: string; quoteToken: string }[] = [];

  constructor(private readonly upbitClient: UpbitClient) {}

  async loadMarketCodes() {
    try {
      const markets = await this.upbitClient.getMarkets();

      // KRW 마켓만 필터링
      this.marketCodes = markets.map((market) => market.market);

      // 마켓 페어 정보 저장
      this.marketPairs = this.marketCodes.map((code) => parseUpbitMarket(code));

      this.logger.debug(`Loaded ${this.marketCodes.length} market codes`);
    } catch (error) {
      this.logger.error('Failed to load market codes:', error);
      throw error;
    }
  }

  getMarketCodes(): string[] {
    return this.marketCodes;
  }

  getMarketPairs() {
    return this.marketPairs;
  }

  // Redis 키 형식으로 변환된 마켓 코드 가져오기
  getRedisKeys(): string[] {
    return this.marketPairs.map(({ baseToken, quoteToken }) =>
      createTickerKey('upbit', baseToken, quoteToken),
    );
  }
}
