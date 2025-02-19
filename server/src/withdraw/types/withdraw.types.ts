export type Exchange =
  | 'upbit'
  | 'binance'
  | 'bithumb'
  | 'okx'
  | 'coinone'
  | 'bybit'
  | 'gateio'
  | 'kucoin'
  | 'mexc'
  | 'coinbase'
  | 'kraken'
  | 'bitget'
  | 'bitfinex'
  | 'bitstamp'
  | 'bitflyer'
  | 'bitmex';
  
export interface PathQueryParams {
  amount: number;
  from: Exchange;
  to: Exchange;
}

export interface PathOption {
  coin: string;
  fromExchange: string;
  toExchange: string;
  amount: number;
  withdrawFee: number;
  estimatedReceiveAmount: number;
  feeInKRW: number;
  exchangeRate: number;
  steps: string[];
  profitRate: number;
  sourceAmountInKRW?: number;
  targetAmountInKRW: number;
  fromPrice: number;
  toPrice: number;
}
