export interface MarketPair {
  baseToken: string; // 실제 거래되는 토큰 (BTC, ETH 등)
  quoteToken: string; // 가격의 기준이 되는 토큰 (KRW, USDT 등)
}

export interface TickerData {
  exchange: 'upbit' | 'binance' | 'bithumb';
  baseToken: string;
  quoteToken: string;
  price: number;
  volume: number;
  change24h: number;
  timestamp: number;
}

export interface ExchangeTickerData {
  price: number;
  timestamp: number;
  volume: number;
  change24h: number;
}

export interface CoinPremiumData {
  [symbol: `${string}-${string}`]: {
    upbit?: ExchangeTickerData;
    binance?: ExchangeTickerData;
    bithumb?: ExchangeTickerData;
  };
}

// Redis 키 생성 유틸리티
export function createTickerKey(
  exchange: string,
  baseToken: string,
  quoteToken: string,
): string {
  return `ticker-${exchange}-${baseToken}-${quoteToken}`;
}

// 마켓 심볼 파싱 유틸리티
export function parseUpbitMarket(market: string): MarketPair {
  const [quoteToken, baseToken] = market.split('-'); // KRW-BTC에서 KRW가 quoteToken, BTC가 baseToken
  return { baseToken, quoteToken };
}

export function parseBinanceMarket(symbol: string): MarketPair {
  // 바이낸스는 BTCUSDT 형태로 옴
  const baseToken = symbol.replace('USDT', ''); // BTC
  return {
    baseToken,
    quoteToken: 'USDT',
  };
}
