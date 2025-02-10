import type { ExchangeValue, QuoteTokenValue } from '@/const/exchange';

export type Exchange = ExchangeValue;
export type QuoteToken = QuoteTokenValue;

export interface ExchangePair {
  from: Exchange;
  to: Exchange;
  fromBase: QuoteToken;
  toBase: QuoteToken;
}

export type SortField = 'name' | 'fromPrice' | 'toPrice' | 'premium' | 'volume' | 'timestamp';
export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  field: SortField;
  direction: SortDirection;
} 