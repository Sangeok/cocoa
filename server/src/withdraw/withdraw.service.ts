import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { FeeClient } from '../collector/clients/fee.client';
import { PathResult, Exchange } from './types/withdraw.types';

@Injectable()
export class WithdrawService {
  private readonly logger = new Logger(WithdrawService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly feeClient: FeeClient,
  ) {}

  async findOptimalPath(
    coin: string,
    amount: number,
    from: Exchange,
    to: Exchange,
  ): Promise<PathResult> {
    try {
      // 1. 수수료 정보 조회
      const withdrawFee = await this.getWithdrawalFee(coin, from);

      // 2. 현재 가격 조회
      const price = await this.getCurrentPrice(coin, from);
      
      // 3. 환율 조회 (바이낸스 -> 업비트 경우에만 필요)
      let exchangeRate = 1;
      if (from === 'binance' || to === 'binance') {
        const rateStr = await this.redisService.get('exchange-rate');
        exchangeRate = rateStr ? Number(rateStr) : 1300;
      }

      // 4. 수수료 계산
      const feeInCoin = withdrawFee;
      const estimatedReceiveAmount = amount - feeInCoin;
      const feeInKRW = from === 'upbit' 
        ? feeInCoin * price
        : feeInCoin * price * exchangeRate;

      return {
        coin,
        fromExchange: from,
        toExchange: to,
        amount,
        withdrawFee: feeInCoin,
        estimatedReceiveAmount,
        feeInKRW,
        exchangeRate: from === 'binance' || to === 'binance' ? exchangeRate : undefined,
      };
    } catch (error) {
      this.logger.error(`Failed to find optimal path: ${error.message}`);
      throw error;
    }
  }

  private async getWithdrawalFee(coin: string, exchange: 'upbit' | 'binance'): Promise<number> {
    const fees = exchange === 'upbit'
      ? await this.feeClient.getUpbitFees()
      : await this.feeClient.getBinanceFees([coin]);

    const fee = fees.find(f => f.symbol === coin);
    if (!fee) {
      throw new Error(`No fee information found for ${coin} on ${exchange}`);
    }

    return Number(fee.withdrawalFee);
  }

  private async getCurrentPrice(coin: string, exchange: 'upbit' | 'binance'): Promise<number> {
    const key = `ticker-${exchange}-${coin}`;
    const tickerStr = await this.redisService.get(key);
    if (!tickerStr) {
      throw new Error(`No price data found for ${coin} on ${exchange}`);
    }

    const ticker = JSON.parse(tickerStr);
    return ticker.price;
  }
} 