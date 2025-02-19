import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FeeClient {
  private readonly logger = new Logger(FeeClient.name);
  private readonly upbitFees: any;
  private readonly binanceFees: any;
  private readonly bithumbFees: any;
  private readonly coinoneFees: any;
  private readonly okxFees: any;

  constructor() {
    const upbitJsonPath = path.join(process.cwd(), 'config', 'upbit-fees.json');
    const binanceJsonPath = path.join(
      process.cwd(),
      'config',
      'binance-fees.json',
    );
    const bithumbJsonPath = path.join(
      process.cwd(),
      'config',
      'bithumb-fees.json',
    );
    const coinoneJsonPath = path.join(
      process.cwd(),
      'config',
      'coinone-fees.json',
    );
    const okxJsonPath = path.join(process.cwd(), 'config', 'okx-fees.json');
    this.upbitFees = JSON.parse(fs.readFileSync(upbitJsonPath, 'utf-8'));
    this.binanceFees = JSON.parse(fs.readFileSync(binanceJsonPath, 'utf-8'));
    this.bithumbFees = JSON.parse(fs.readFileSync(bithumbJsonPath, 'utf-8'));
    this.coinoneFees = JSON.parse(fs.readFileSync(coinoneJsonPath, 'utf-8'));
    this.okxFees = JSON.parse(fs.readFileSync(okxJsonPath, 'utf-8'));
  }

  async getUpbitFees(): Promise<{ symbol: string; withdrawalFee: string }[]> {
    try {
      return this.upbitFees.currencies.map((currency) => {
        // USDT와 같이 여러 네트워크가 있는 경우 가장 낮은 수수료의 네트워크 선택
        if (Array.isArray(currency.withdrawalFee)) {
          const fees = currency.withdrawalFee.map((fee) =>
            parseFloat(fee.split(' ')[0].replace(',', '')),
          );
          const minFee = Math.min(...fees);
          return {
            symbol: currency.currency,
            withdrawalFee: minFee.toString(),
          };
        }

        // 일반적인 경우
        const feeValue = currency.withdrawalFee.split(' ')[0].replace(',', '');
        return {
          symbol: currency.currency,
          withdrawalFee: feeValue,
        };
      });
    } catch (error) {
      this.logger.error('Failed to get Upbit fees', error);
      throw error;
    }
  }

  async getOkxFees(): Promise<{ symbol: string; withdrawalFee: string }[]> {
    try {
      const fees: any[] = [];
      this.okxFees.currencies.forEach((currency: any) => {
        if (currency.networks) {
          // 여러 네트워크가 있는 경우
          currency.networks.forEach((network: any) => {
            fees.push({
              symbol: currency.currency,
              network: network.network,
              withdrawalFee: network.withdrawalFee,
              minimumWithdrawal: network.minimumWithdrawal,
              depositFee: network.depositFee,
            });
          });
        } else {
          // 단일 네트워크
          fees.push({
            symbol: currency.currency,
            network: currency.network,
            withdrawalFee: currency.withdrawalFee,
            minimumWithdrawal: currency.minimumWithdrawal,
            depositFee: currency.depositFee,
          });
        }
      });

      return fees;
    } catch (error) {
      this.logger.error('Failed to get Okx fees', error);
      throw error;
    }
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

  async getBithumbFees(): Promise<
    Array<{
      symbol: string;
      network: string;
      withdrawalFee: string;
      minimumWithdrawal: string;
      depositFee: string;
    }>
  > {
    try {
      const fees: any[] = [];

      this.bithumbFees.currencies.forEach((currency: any) => {
        if (currency.networks) {
          // 여러 네트워크가 있는 경우
          currency.networks.forEach((network: any) => {
            fees.push({
              symbol: currency.currency,
              network: network.network,
              withdrawalFee: network.withdrawalFee,
              minimumWithdrawal: network.minimumWithdrawal,
              depositFee: network.depositFee,
            });
          });
        } else {
          // 단일 네트워크
          fees.push({
            symbol: currency.currency,
            network: currency.network,
            withdrawalFee: currency.withdrawalFee,
            minimumWithdrawal: currency.minimumWithdrawal,
            depositFee: currency.depositFee,
          });
        }
      });

      return fees;
    } catch (error) {
      this.logger.error('Failed to get Bithumb fees', error);
      throw error;
    }
  }

  async getCoinoneFees(): Promise<
    Array<{
      symbol: string;
      network: string;
      withdrawalFee: string;
      minimumWithdrawal: string;
      depositFee: string;
    }>
  > {
    try {
      const fees: any[] = [];

      this.coinoneFees.currencies.forEach((currency: any) => {
        if (currency.networks) {
          // 여러 네트워크가 있는 경우
          currency.networks.forEach((network: any) => {
            fees.push({
              symbol: currency.currency,
              network: network.network,
              withdrawalFee: network.withdrawalFee,
              minimumWithdrawal: network.minimumWithdrawal,
              depositFee: network.depositFee,
            });
          });
        } else {
          // 단일 네트워크
          fees.push({
            symbol: currency.currency,
            network: currency.network,
            withdrawalFee: currency.withdrawalFee,
            minimumWithdrawal: currency.minimumWithdrawal,
            depositFee: currency.depositFee,
          });
        }
      });

      return fees;
    } catch (error) {
      this.logger.error('Failed to get Coinone fees', error);
      throw error;
    }
  }
}
