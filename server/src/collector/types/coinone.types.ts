export interface CoinoneMarketResponse {
  market: string;
  korean_name: string;
  english_name: string;
  market_warning: string;
}

export interface CoinoneTickerContent {
  quote_currency: string;
  target_currency: string;
  timestamp: number;
  quote_volume: string;
  target_volume: string;
  high: string;
  low: string;
  first: string;
  last: string;
  yesterday_high: string;
  yesterday_low: string;
  yesterday_first: string;
  yesterday_last: string;
  volume_power: string;
  ask_best_price: string;
  ask_best_qty: string;
  bid_best_price: string;
  bid_best_qty: string;
  id: string;
}

export interface CoinoneTickerResponse {
  response_type: string;
  channel: string;
  data: CoinoneTickerContent;
}

export interface CoinoneSubscribeRequest {
  request_type: 'SUBSCRIBE' | 'UNSUBSCRIBE' | 'PING';
  channel?: 'TICKER';
  topic?: {
    quote_currency: string;
    target_currency: string;
  };
} 