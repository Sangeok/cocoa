import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FeeClient {
  private readonly logger = new Logger(FeeClient.name);
  private readonly upbitFees: any;
  private readonly binanceFees: any;

  constructor() {
    const upbitJsonPath = path.join(process.cwd(), 'config', 'upbit-fees.json');
    const binanceJsonPath = path.join(
      process.cwd(),
      'config',
      'binance-fees.json',
    );

    this.upbitFees = JSON.parse(fs.readFileSync(upbitJsonPath, 'utf-8'));
    this.binanceFees = JSON.parse(fs.readFileSync(binanceJsonPath, 'utf-8'));
  }

  async getUpbitFees(): Promise<
    Array<{
      symbol: string;
      network: string;
      withdrawalFee: string;
      minimumWithdrawal: string;
      depositFee: string;
    }>
  > {
    return this.upbitFees.currencies.map((fee) => ({
      symbol: fee.currency,
      network: fee.network,
      withdrawalFee: fee.withdrawalFee,
      minimumWithdrawal: fee.minimumWithdrawal,
      depositFee: fee.depositFee,
    }));
  }

  async getBinanceFees(symbols?: string[]): Promise<
    Array<{
      symbol: string;
      network: string;
      withdrawalFee: string;
      minimumWithdrawal: string;
      depositFee: string;
    }>
  > {
    const targetSymbols =
      symbols || this.binanceFees.currencies.map((c) => c.symbol);
    const fees: any[] = [];

    for (const symbol of targetSymbols) {
      const currencyData = this.binanceFees.currencies.find(
        (c: any) => c.symbol === symbol,
      );

      if (currencyData) {
        currencyData.networks.forEach((network: any) => {
          fees.push({
            symbol,
            network: network.network,
            withdrawalFee: network.withdrawalFee,
            minimumWithdrawal: network.minimumWithdrawal,
            depositFee: network.depositFee,
          });
        });
      }
    }

    return fees;
  }
}
