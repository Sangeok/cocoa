export interface BinanceRequest {
  id: string;
  method: 'trades.recent';
  params: {
    symbol: string;
    limit: number;
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
  result: BinanceTradeResult[];
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

export interface BinanceTickerData {
  exchange: 'binance';
  symbol: string;
  price: number;
  quantity: number;
  timestamp: number;
}
