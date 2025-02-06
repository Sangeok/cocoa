import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { RedisService } from '../redis/redis.service';
import { AppGateway } from '../gateway/app.gateway';
import { UpbitTickerData } from '../collector/types/upbit.types';
import { BinanceTickerData } from '../collector/types/binance.types';

interface ExchangeRateData {
  rate: number;
  timestamp: number;
}

interface CombinedMarketData {
  symbol: string;
  upbit: {
    price: number;
    volume24h: number;
  };
  binance: {
    price: number;
    volume24h: number;
  };
  priceDifference: number; // 가격 차이 (%)
  exchangeRate: number;
  timestamp: number;
}

@Injectable()
export class ExchangeService {
  private readonly logger = new Logger(ExchangeService.name);
  private currentExchangeRate: number = 0;
  private lastExchangeRateUpdate: number = 0;

  constructor(
    private readonly redisService: RedisService,
    private readonly appGateway: AppGateway,
  ) {}

  @Interval(1000) // 1초마다 실행
  async processMarketData() {
    try {
      // 환율 정보 가져오기
      const exchangeRateData = await this.getExchangeRate();
      if (!exchangeRateData) return;

      // 환율이 변경되었거나 마지막 업데이트로부터 10초가 지났을 때만 전송
      if (
        this.currentExchangeRate !== exchangeRateData.rate ||
        Date.now() - this.lastExchangeRateUpdate > 10000
      ) {
        this.currentExchangeRate = exchangeRateData.rate;
        this.lastExchangeRateUpdate = Date.now();
        
        // 환율 정보 별도 전송
        this.appGateway.emitExchangeRate({
          rate: this.currentExchangeRate,
          timestamp: exchangeRateData.timestamp,
        });
      }

      // Redis에서 모든 키 가져오기
      const upbitKeys = await this.redisService.getKeys('ticker-upbit-*');
      const binanceKeys = await this.redisService.getKeys('ticker-binance-*');

      // 각 거래소의 데이터 매핑
      const marketData: Map<string, CombinedMarketData> = new Map();

      // Upbit 데이터 처리
      for (const key of upbitKeys) {
        const data = await this.redisService.get(key);
        if (!data) continue;

        const tickerData = JSON.parse(data) as UpbitTickerData;
        const symbol = key.replace('ticker-upbit-KRW-', '');

        marketData.set(symbol, {
          symbol,
          upbit: {
            price: tickerData.price,
            volume24h: tickerData.volume24h,
          },
          binance: {
            price: 0,
            volume24h: 0,
          },
          priceDifference: 0,
          exchangeRate: this.currentExchangeRate,
          timestamp: tickerData.timestamp,
        });
      }

      // Binance 데이터 처리 및 가격 차이 계산
      for (const key of binanceKeys) {
        const data = await this.redisService.get(key);
        if (!data) continue;

        const tickerData = JSON.parse(data) as BinanceTickerData;
        const symbol = tickerData.symbol.replace('USDT', '');

        if (marketData.has(symbol)) {
          const marketInfo = marketData.get(symbol)!;
          const binancePriceInKRW = parseFloat(tickerData.price) * this.currentExchangeRate;

          marketInfo.binance = {
            price: parseFloat(tickerData.price),
            volume24h: parseFloat(tickerData.quantity),
          };

          // 가격 차이 계산 (%)
          marketInfo.priceDifference = 
            ((marketInfo.upbit.price - binancePriceInKRW) / binancePriceInKRW) * 100;

          marketInfo.timestamp = Math.max(marketInfo.timestamp, tickerData.timestamp);
          marketData.set(symbol, marketInfo);
        }
      }

      // 웹소켓으로 데이터 전송
      this.emitMarketData(Array.from(marketData.values()));

    } catch (error) {
      this.logger.error('Error processing market data:', error);
    }
  }

  private async getExchangeRate(): Promise<ExchangeRateData | null> {
    try {
      const rateData = await this.redisService.get('krw-usd-rate');
      if (!rateData) return null;
      return JSON.parse(rateData) as ExchangeRateData;
    } catch (error) {
      this.logger.error('Error fetching exchange rate:', error);
      return null;
    }
  }

  private emitMarketData(data: CombinedMarketData[]) {
    // 각 코인에 대한 데이터 전송
    data.forEach(marketInfo => {
      this.appGateway.emitCoinPrice({
        exchange: 'combined',
        symbol: marketInfo.symbol,
        price: marketInfo.upbit.price,
        difference: marketInfo.priceDifference,
        timestamp: marketInfo.timestamp,
        upbitPrice: marketInfo.upbit.price,
        binancePrice: marketInfo.binance.price,
        upbitVolume: marketInfo.upbit.volume24h,
        binanceVolume: marketInfo.binance.volume24h,
      });
    });
  }
} 