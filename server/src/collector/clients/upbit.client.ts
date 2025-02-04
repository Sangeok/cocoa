import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { UpbitMarketResponse } from '../types/upbit.types';

interface UpbitTicker {
  market: string;
  trade_price: number;
  acc_trade_price_24h: number;
  signed_change_rate: number;
}

interface TopVolumeCoin {
  symbol: string;
  currentPrice: number;
  volume: number;
  priceChange: number;
}

@Injectable()
export class UpbitClient {
  private readonly logger = new Logger(UpbitClient.name);
  private readonly baseUrl = 'https://api.upbit.com/v1';

  async getMarkets(): Promise<UpbitMarketResponse[]> {
    try {
      const { data } = await axios.get<UpbitMarketResponse[]>(
        `${this.baseUrl}/market/all`,
      );  
      return data;
    } catch (error) {
      this.logger.error('Failed to fetch Upbit markets', error);
      throw error;
    }
  }

  async getTopVolumeCoins(limit: number): Promise<TopVolumeCoin[]> {
    try {
      // 1. 모든 KRW 마켓 조회
      const markets = await this.getMarkets();
      const krwMarkets = markets
        .filter(market => market.market.startsWith('KRW-'))
        .map(market => market.market);

      // 2. 티커 정보 조회
      const { data: tickers } = await axios.get<UpbitTicker[]>(
        `${this.baseUrl}/ticker`,
        {
          params: {
            markets: krwMarkets.join(','),
          },
        },
      );

      // 3. 거래량 기준으로 정렬하고 상위 N개 추출
      const topCoins = tickers
        .sort((a, b) => b.acc_trade_price_24h - a.acc_trade_price_24h)
        .slice(0, limit)
        .map(ticker => ({
          symbol: ticker.market.replace('KRW-', ''),
          currentPrice: ticker.trade_price,
          volume: ticker.acc_trade_price_24h,
          priceChange: ticker.signed_change_rate * 100, // 변화율을 퍼센트로 변환
        }));

      return topCoins;
    } catch (error) {
      this.logger.error('Failed to fetch top volume coins', error);
      throw error;
    }
  }
} 