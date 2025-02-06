export interface NewsData {
  symbol: string;
  content: string;
  timestamp: Date;
  marketData: {
    volume: number;
    priceChange: number;
    currentPrice: number;
  };
}

export interface NewsQueryOptions {
  limit: number;
  offset: number;
  symbol?: string;
  orderBy?: {
    [key: string]: 'asc' | 'desc';
  };
  where?: {
    symbol?: string;
    timestamp?: {
      gte?: Date;
      lte?: Date;
    };
  };
} 