import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { FeeClient } from '../collector/clients/fee.client';
import { PathOption, Exchange } from './types/withdraw.types';
import { createTickerKey, TickerData } from '../collector/types/common.types';

@Injectable()
export class WithdrawService {
  private readonly logger = new Logger(WithdrawService.name);
  private readonly KOREA_EXCHANGES = ['upbit', 'bithumb'];

  constructor(
    private readonly redisService: RedisService,
    private readonly feeClient: FeeClient,
  ) {}

  async findOptimalPath(
    amount: number,
    from: Exchange,
    to: Exchange,
  ): Promise<PathOption[]> {
    try {
      const isFromKorea = this.KOREA_EXCHANGES.includes(from);
      if (isFromKorea) {
        return this.calculateKoreaToGlobalPaths(amount, from, to);
      } else {
        return this.calculateGlobalToKoreaPaths(amount, from, to);
      }
    } catch (error) {
      this.logger.error(`Failed to find optimal paths: ${error.message}`);
      throw error;
    }
  }

  private async getAvailableCoins(
    from: Exchange,
    to: Exchange,
  ): Promise<string[]> {
    try {
      let fromFees;
      let toFees;

      // Get fees for source exchange
      switch (from) {
        case 'upbit':
          fromFees = await this.feeClient.getUpbitFees();
          break;
        case 'bithumb':
          fromFees = await this.feeClient.getBithumbFees();
          break;
        case 'binance':
          fromFees = await this.feeClient.getBinanceFees();
          break;
      }

      // Get fees for target exchange
      switch (to) {
        case 'upbit':
          toFees = await this.feeClient.getUpbitFees();
          break;
        case 'bithumb':
          toFees = await this.feeClient.getBithumbFees();
          break;
        case 'binance':
          toFees = await this.feeClient.getBinanceFees();
          break;
      }

      this.logger.debug(
        `From exchange (${from}) coins: ${fromFees.map((f) => f.symbol).join(', ')}`,
      );
      this.logger.debug(
        `To exchange (${to}) coins: ${toFees.map((f) => f.symbol).join(', ')}`,
      );

      // 중복 제거를 위해 Set 사용
      const fromCoins = new Set(fromFees.map((f) => f.symbol));
      const toCoins = new Set(toFees.map((f) => f.symbol));

      // 교집합 구하기
      const availableCoins = [...fromCoins].filter((coin) => toCoins.has(coin));
      this.logger.debug(
        `Available coins after dedup: ${availableCoins.join(', ')}`,
      );

      // 실제 가격 데이터가 있는 코인만 필터링
      const coinsWithPrices = await Promise.all(
        availableCoins.map(async (coin: string) => {
          try {
            await this.getCurrentPrice(coin, from);
            await this.getCurrentPrice(coin, to);
            return coin;
          } catch {
            return null;
          }
        }),
      );

      const finalCoins = coinsWithPrices.filter(
        (coin): coin is string => coin !== null,
      );
      this.logger.debug(
        `Final available coins with prices: ${finalCoins.join(', ')}`,
      );

      return finalCoins;
    } catch (error) {
      this.logger.error(`Failed to get available coins: ${error.message}`);
      throw error;
    }
  }

  private async calculateKoreaToGlobalPaths(
    amount: number,
    from: Exchange,
    to: Exchange,
  ): Promise<PathOption[]> {
    const paths: PathOption[] = [];
    const availableCoins = await this.getAvailableCoins(from, to);

    for (const coin of availableCoins) {
      try {
        // 1. 원화로 코인 구매 시의 수량 계산
        const fromPrice = await this.getCurrentPrice(coin, from);
        const coinAmount = amount / fromPrice;

        // 수량이 0인 경우 스킵
        if (coinAmount <= 0 || coinAmount === null || fromPrice === 0) {
          continue;
        }

        // 2. 출금 수수료 계산
        const withdrawFee = await this.getWithdrawalFee(coin, from);
        const estimatedReceiveAmount = coinAmount - withdrawFee;

        // 예상 수령액이 0 이하인 경우 제외
        if (estimatedReceiveAmount <= 0 || estimatedReceiveAmount === null) {
          continue;
        }

        // 3. 도착 거래소에서의 가치 계산
        const toPrice = await this.getCurrentPrice(coin, to);
        const finalValueInUSD = estimatedReceiveAmount * toPrice;

        // 4. 수수료의 원화 가치 계산
        const feeInKRW = withdrawFee * fromPrice;

        const exchangeRate = await this.getExchangeRate();

        // 5. 수익률 계산 (도착지 가치 / 출발지 가치 - 1)
        const profitRate =
          ((finalValueInUSD * exchangeRate) / amount - 1) * 100;

        paths.push({
          coin,
          fromExchange: from,
          toExchange: to,
          amount: coinAmount,
          withdrawFee,
          estimatedReceiveAmount,
          feeInKRW,
          exchangeRate,
          profitRate,
          sourceAmountInKRW: amount,
          targetAmountInKRW: finalValueInUSD * exchangeRate,
          fromPrice: fromPrice,
          toPrice: toPrice,
          steps: [
            `원화로 ${coin} 구매 (${this.formatKRW(fromPrice)}/개)`,
            `${to}로 ${coin} 송금`,
            '필요한 경우 다른 코인으로 변환',
          ],
        });
      } catch (error) {
        this.logger.warn(
          `Failed to calculate path for ${coin}: ${error.message}`,
        );
        continue;
      }
    }

    // 수익률 기준으로 정렬하고 필터링
    return paths.sort((a, b) => b.profitRate - a.profitRate).slice(0, 10);
  }

  private async calculateGlobalToKoreaPaths(
    amount: number,
    from: Exchange,
    to: Exchange,
  ): Promise<PathOption[]> {
    const paths: PathOption[] = [];
    const availableCoins = await this.getAvailableCoins(from, to);

    for (const coin of availableCoins) {
      try {
        // 1. USDT로 코인 구매 시의 수량 계산
        const fromPrice = await this.getCurrentPrice(coin, from);
        const coinAmount = amount / fromPrice;

        // 수량이 0인 경우 스킵
        if (coinAmount <= 0) {
          continue;
        }

        // 2. 출금 수수료 계산
        const withdrawFee = await this.getWithdrawalFee(coin, from);
        const estimatedReceiveAmount = coinAmount - withdrawFee;

        // 예상 수령액이 0 이하인 경우 제외
        if (estimatedReceiveAmount <= 0) {
          continue;
        }

        // 3. 도착 거래소에서의 원화 가치 계산
        const toPrice = await this.getCurrentPrice(coin, to);
        const finalValueInKRW = estimatedReceiveAmount * toPrice;

        const exchangeRate = await this.getExchangeRate();

        // 4. 수수료의 USD 가치 계산 후 원화로 변환
        const feeInKRW = withdrawFee * fromPrice * exchangeRate;

        // 5. 수익률 계산 (도착지 원화 가치 / 출발지 원화 가치 - 1)
        const profitRate =
          (finalValueInKRW / (amount * exchangeRate) - 1) * 100;

        paths.push({
          coin,
          fromExchange: from,
          toExchange: to,
          amount: coinAmount,
          withdrawFee,
          estimatedReceiveAmount,
          feeInKRW,
          exchangeRate,
          profitRate,
          sourceAmountInKRW: amount * exchangeRate,
          targetAmountInKRW: finalValueInKRW,
          fromPrice: fromPrice,
          toPrice: toPrice,
          steps: [
            `${coin} 준비 ($${fromPrice.toFixed(2)}/개)`,
            `${to}로 ${coin} 송금`,
            `${coin}을 원화로 환전`,
          ],
        });
      } catch (error) {
        this.logger.warn(
          `Failed to calculate path for ${coin}: ${error.message}`,
        );
        continue;
      }
    }

    return paths.sort((a, b) => b.profitRate - a.profitRate).slice(0, 10);
  }

  private async getExchangeRate(): Promise<number> {
    const rateStr = await this.redisService.get('krw-usd-rate');
    return rateStr ? Number(rateStr) : 1300;
  }

  private async getWithdrawalFee(
    coin: string,
    exchange: Exchange,
  ): Promise<number> {
    try {
      let fees;
      switch (exchange) {
        case 'upbit':
          fees = await this.feeClient.getUpbitFees();
          break;
        case 'bithumb':
          fees = await this.feeClient.getBithumbFees();
          break;
        case 'binance':
          fees = await this.feeClient.getBinanceFees([coin]);
          break;
        default:
          throw new Error(`Unsupported exchange: ${exchange}`);
      }

      const fee = fees.find((f) => f.symbol === coin);
      if (!fee) {
        throw new Error(`No fee information found for ${coin} on ${exchange}`);
      }

      return Number(fee.withdrawalFee);
    } catch (error) {
      this.logger.error(`Failed to get withdrawal fee: ${error.message}`);
      throw error;
    }
  }

  private async getCurrentPrice(
    coin: string,
    exchange: Exchange,
  ): Promise<number> {
    try {
      if (exchange === 'binance') {
        if (coin === 'USDT') return 1;
        const key = createTickerKey(exchange, 'USDT', coin);
        const tickerStr = await this.redisService.get(key);
        if (!tickerStr)
          throw new Error(`No price data found for ${coin} on ${exchange}`);
        const ticker: TickerData = JSON.parse(tickerStr);
        return ticker.price;
      } else if (exchange === 'bithumb') {
        // 빗썸의 경우 "{symbol}-{quoteToken}" 형식으로 저장됨
        let tickerStr = await this.redisService.get(
          `ticker-bithumb-${coin}-KRW`,
        );
        if (!tickerStr) {
          tickerStr = await this.redisService.get(
            `ticker-bithumb-${coin}-USDT`,
          );
        }

        if (!tickerStr) {
          tickerStr = await this.redisService.get(`ticker-bithumb-${coin}-BTC`);
        }

        if (!tickerStr)
          throw new Error(`No price data found for ${coin} on ${exchange}`);
        const ticker: TickerData = JSON.parse(tickerStr);
        return ticker.price;
      } else {
        // 업비트와 빗썸은 KRW 마켓 우선 조회
        let key = createTickerKey(exchange, 'KRW', coin);
        let tickerStr = await this.redisService.get(key);

        // KRW 마켓이 없으면 USDT 마켓 조회
        if (!tickerStr) {
          key = createTickerKey(exchange, 'USDT', coin);
          tickerStr = await this.redisService.get(key);
        }

        if (!tickerStr)
          throw new Error(`No price data found for ${coin} on ${exchange}`);
        const ticker: TickerData = JSON.parse(tickerStr);
        return ticker.price;
      }
    } catch (error) {
      this.logger.error(
        `Failed to get price for ${coin} on ${exchange}: ${error.message}`,
      );
      throw error;
    }
  }

  private formatKRW(amount: number): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  }
}
