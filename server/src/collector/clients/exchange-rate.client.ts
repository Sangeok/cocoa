import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class ExchangeRateClient {
  private readonly logger = new Logger(ExchangeRateClient.name);

  async getUsdKrwRate(): Promise<number> {
    try {
      const { data } = await axios.get('https://www.google.com/finance/quote/USD-KRW', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      const $ = cheerio.load(data);
      const rateText = $('.YMlKec.fxKbKc').first().text();
      const rate = parseFloat(rateText.replace(/,/g, ''));
      
      if (isNaN(rate)) {
        throw new Error('Failed to parse exchange rate');
      }
      
      return rate;
    } catch (error) {
      this.logger.error('Failed to fetch USD-KRW exchange rate', error);
      throw error;
    }
  }
} 