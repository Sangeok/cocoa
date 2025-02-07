export interface UpbitMarketResponse {
  market: string;
  korean_name: string;
  english_name: string;
  market_warning: 'NONE' | 'CAUTION';
} 

export interface UpbitTickerResponse {
  type: string;
  code: string;
  trade_price: number;
  signed_change_rate: number;
  timestamp: number;
  acc_trade_price_24h: number;
}

export interface UpbitTickerData {
  exchange: 'upbit';
  price: number;
  change: number;
  timestamp: number;
  volume24h: number;
}

export interface UpbitFee {
  currency: string;
  network: string;
}