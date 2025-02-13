import { formatKRW } from "./format";

type MarketType = 'KRW' | 'USDT' | 'BTC';

export const getMarketType = (symbol: string): MarketType => {
  if (symbol.endsWith('-KRW')) return 'KRW';
  if (symbol.endsWith('-USDT')) return 'USDT';
  if (symbol.endsWith('-BTC')) return 'BTC';
  return 'KRW'; // 기본값
};

export const getPriorityExchanges = (marketType: MarketType): string[] => {
  switch (marketType) {
    case 'KRW':
      return ['upbit', 'bithumb'];
    case 'USDT':
      return ['upbit', 'binance'];
    case 'BTC':
      return ['upbit', 'binance'];
    default:
      return ['upbit'];
  }
};

export const formatPriceByMarket = (price: number, marketType: MarketType): string => {
  switch (marketType) {
    case 'KRW':
      return formatKRW(price);
    case 'USDT':
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'BTC':
      return `${price.toFixed(8)} BTC`;
    default:
      return formatKRW(price);
  }
}; 