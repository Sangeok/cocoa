import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class FeeClient {
  private readonly logger = new Logger(FeeClient.name);

  async getUpbitFees(): Promise<Array<{
    symbol: string;
    network: string;
    withdrawalFee: string;
    minimumWithdrawal: string;
    depositFee: string;
  }>> {
    try {
      const { data } = await axios.get('https://upbit.com/service_center/guide');
      const $ = cheerio.load(data);
      const fees: any[] = [];

      // Upbit의 수수료 테이블 파싱 로직
      $('.table tbody tr').each((_, row) => {
        const columns = $(row).find('td');
        fees.push({
          symbol: $(columns[0]).text().trim(),
          network: $(columns[1]).text().trim(),
          minimumWithdrawal: $(columns[2]).text().trim(),
          withdrawalFee: $(columns[3]).text().trim(),
          depositFee: '0', // Upbit는 입금 수수료 없음
        });
      });

      return fees;
    } catch (error) {
      this.logger.error('Failed to fetch Upbit fees', error);
      throw error;
    }
  }

  async getBinanceFees(symbols: string[]): Promise<Array<{
    symbol: string;
    network: string;
    withdrawalFee: string;
    minimumWithdrawal: string;
    depositFee: string;
  }>> {
    try {
      const { data } = await axios.get('https://www.binance.com/api/v3/exchangeInfo');
      const fees: any[] = [];

      // Binance API를 통한 수수료 정보 수집
      for (const symbol of symbols) {
        const feeData = await axios.get(`https://www.binance.com/api/v3/asset/assetDetail`, {
          params: { asset: symbol }
        });
        
        if (feeData.data[symbol]) {
          fees.push({
            symbol,
            network: feeData.data[symbol].network,
            withdrawalFee: feeData.data[symbol].withdrawFee,
            minimumWithdrawal: feeData.data[symbol].minWithdrawAmount,
            depositFee: '0', // Binance는 입금 수수료 없음
          });
        }
      }

      return fees;
    } catch (error) {
      this.logger.error('Failed to fetch Binance fees', error);
      throw error;
    }
  }
} 