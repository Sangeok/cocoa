export interface BinanceRequestParams {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET';
  price: string;
  quantity: string;
  timeInForce: 'GTC' | 'IOC' | 'FOK';
  timestamp: number;
  apiKey: string;
  signature: string;
}

export interface BinanceRequest {
  id: string;
  method: string;
  params: BinanceRequestParams;
}

export interface RateLimit {
  rateLimitType: string;
  interval: string;
  intervalNum: number;
  limit: number;
  count: number;
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

export interface BinanceSuccessResponse {
  id: string;
  status: number;
  result: BinanceOrderResult;
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