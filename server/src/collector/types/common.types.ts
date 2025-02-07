export interface MarketPair {
  baseToken: string;    // 기준이 되는 토큰 (KRW, BTC, USDT 등)
  quoteToken: string;   // 거래되는 토큰 (BTC, ETH 등)
}

export interface TickerData {
  exchange: 'upbit' | 'binance';
  baseToken: string;
  quoteToken: string;
  price: number;
  volume: number;
  timestamp: number;
}

// Redis 키 생성 유틸리티
export function createTickerKey(exchange: string, baseToken: string, quoteToken: string): string {
  return `ticker-${exchange}-${baseToken}-${quoteToken}`;
}

// 마켓 심볼 파싱 유틸리티
export function parseUpbitMarket(market: string): MarketPair {
  const [baseToken, quoteToken] = market.split('-');
  return { baseToken, quoteToken };
}

export function parseBinanceMarket(symbol: string): MarketPair {
  // 바이낸스는 BTCUSDT 형태로 옴 (quoteToken + baseToken)
  const quoteToken = symbol.replace('USDT', '');
  return { 
    baseToken: 'USDT',
    quoteToken
  };
} 