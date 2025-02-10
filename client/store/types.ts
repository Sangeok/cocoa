
export interface CoinPrice {
  exchange: 'upbit' | 'binance';
  baseToken: string;
  quoteToken: string;
  price: number;
  volume: number;
  timestamp: number;
}

export interface ExchangeRate {
  rate: number;
  timestamp: number;
}

export interface PremiumMarket {
  symbol: string;
  upbitPrice: number;
  upbitVolume: number;
  binancePrice: number;
  binancePriceKRW: number;
  binanceVolume: number;
  premium: number;
}

export interface MarketState {
  upbit: Exchange;
  binance: Exchange;
  exchangeRate: ExchangeRate | null;
  lastUpdate: number;
}

export interface MarketStore extends MarketState {
  updateCoinPrice: (data: CoinPrice) => void;
  updateExchangeRate: (data: ExchangeRate) => void;
}

export interface TickerData {
  price: number;
  volume: number;
  change24h: number;
  timestamp: number;
}

export interface BaseTokenMarket {
  [quoteToken: string]: TickerData;
}

export interface Exchange {
  [baseToken: string]: BaseTokenMarket;
} 