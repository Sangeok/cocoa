export type Exchange = 'upbit' | 'binance';

export interface PathQueryParams {
  coin: string;
  amount: number;
  from: Exchange;
  to: Exchange;
}

export interface PathResult {
  coin: string;
  fromExchange: string;
  toExchange: string;
  amount: number;
  withdrawFee: number;
  estimatedReceiveAmount: number;
  feeInKRW: number;
  exchangeRate?: number;
}
