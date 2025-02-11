export interface BithumbMarketResponse {
  market: string;
  korean_name: string;
  english_name: string;
  market_warning: string;
};

export interface BithumbTickerContent {
  symbol: string; // 통화코드
  tickType: string; // 변동 기준시간- 30M, 1H, 12H, 24H, MID
  date: string; // 일자
  time: string; // 시간
  openPrice: string; // 시가
  closePrice: string; // 종가
  lowPrice: string; // 저가
  highPrice: string; // 고가
  value: string; // 누적거래금액
  volume: string; // 누적거래량
  sellVolume: string; // 매도누적거래량
  buyVolume: string; // 매수누적거래량
  prevClosePrice: string; // 전일종가
  chgRate: string; // 변동률
  chgAmt: string; // 변동금액
  volumePower: string; // 체결강도
}

export interface BithumbTickerResponse {
  type: string;
  content: BithumbTickerContent;
}
