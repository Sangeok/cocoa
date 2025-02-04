import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { UpbitMarketResponse } from '../types/upbit.types';

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
} 