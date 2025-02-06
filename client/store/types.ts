export interface CoinPrice {
  exchange: string;
  symbol: string;
  price: number;
  difference: number;
  timestamp: number;
  upbitPrice?: number;
  binancePrice?: number;
  upbitVolume?: number;
  binanceVolume?: number;
}

export interface ExchangeRate {
  rate: number;
  timestamp: number;
}

export interface MarketState {
  coinPrices: Record<string, CoinPrice>; // symbol을 키로 사용
  exchangeRate: ExchangeRate | null;
  lastUpdate: number;
} 