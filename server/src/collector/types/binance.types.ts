export interface BinanceRequest {
  id: string;
  method: 'ticker.24hr';
  params: {
    symbols: string[];
    type: 'MINI' | 'FULL';
  };
}

export interface RateLimit {
  rateLimitType: string;
  interval: string;
  intervalNum: number;
  limit: number;
  count: number;
}

export interface BinanceTradeResult {
  id: number;
  price: string;
  qty: string;
  quoteQty: string;
  time: number;
  isBuyerMaker: boolean;
  isBestMatch: boolean;
}

export interface BinanceOrderResult {
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  transactTime: number;
  price: string;
  origQty: string;
  executedQty: string;
  origQuoteOrderQty: string;
  cummulativeQuoteQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
  workingTime: number;
  selfTradePreventionMode: string;
}

export interface BinanceOrderBookResult {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
}

export interface BinanceSuccessResponse {
  id: string;
  status: number;
  result: Binance24hrFullTicker[];
  rateLimits: RateLimit[];
}

export interface BinanceErrorResponse {
  id: string;
  status: number;
  error: {
    code: number;
    msg: string;
  };
  rateLimits: RateLimit[];
}

export type BinanceResponse = BinanceSuccessResponse | BinanceErrorResponse;

export interface Binance24hrFullTicker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

export interface Binance24hrMiniTicker {
  symbol: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  lastPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

// 기존 BinanceTickerData는 common.types.ts의 TickerData로 대체
