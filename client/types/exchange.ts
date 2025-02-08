import type { ExchangeValue, QuoteTokenValue } from '@/const/exchange';

export type Exchange = ExchangeValue;
export type QuoteToken = QuoteTokenValue;

export interface ExchangePair {
  from: Exchange;
  to: Exchange;
  fromBase: QuoteToken;
  toBase: QuoteToken;
}

export interface Market {
  exchange: Exchange;
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
}

export interface CoinData {
  [exchange: string]: {
    price: number;
    volume: number;
    timestamp: number;
  };
}

export interface ExchangeRates {
  USDT: { KRW: number };
  BTC: { 
    KRW: number;
    USDT: number;
  };
}

export type SortField = 'name' | 'fromPrice' | 'toPrice' | 'premium' | 'volume' | 'timestamp';
export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  field: SortField;
  direction: SortDirection;
} 