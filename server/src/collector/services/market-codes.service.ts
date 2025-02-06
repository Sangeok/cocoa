import { Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { join } from 'path';

interface UpbitFee {
  currency: string;
  network: string;
}

@Injectable()
export class MarketCodesService {
  private marketCodes: string[] = [];

  async loadMarketCodes(): Promise<string[]> {
    try {
      const feesFile = await readFile(
        join(process.cwd(), 'config', 'upbit-fees.json'),
        'utf-8',
      );
      const fees = JSON.parse(feesFile) as { currencies: UpbitFee[] };
      
      this.marketCodes = fees.currencies
        .filter(fee => fee.currency !== 'KRW')
        .map(fee => `KRW-${fee.currency}`);

      return this.marketCodes;
    } catch (error) {
      throw new Error(`Failed to load market codes: ${error.message}`);
    }
  }

  getMarketCodes(): string[] {
    return this.marketCodes;
  }
} 