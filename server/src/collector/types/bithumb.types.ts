export interface BithumbMarketResponse {
  market: string;
  korean_name: string;
  english_name: string;
  market_warning: string;
};

export interface BithumbTickerContent {
  symbol: string;
  tickType: string;
  date: string;
  time: string;
  openPrice: string;
  closePrice: string;
  lowPrice: string;
  highPrice: string;
  value: string;
  volume: string;
  sellVolume: string;
  buyVolume: string;
  prevClosePrice: string;
  chgRate: string;
  chgAmt: string;
  volumePower: string;
}

export interface BithumbTickerResponse {
  type: string;
  content: BithumbTickerContent;
}
