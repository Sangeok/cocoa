export type Exchange = 'upbit' | 'bithumb' | 'binance' | 'coinone';
export type Position = 'L' | 'S';
export type Duration = 30 | 180;

export interface PredictData {
  market: string;
  exchange: Exchange;
  createdAt: number;
  price: number;
  position: Position;
  finishedAt: number;
}

export interface PredictResult {
  isWin: boolean;
  isDraw?: boolean;
  market: string;
  entryPrice: number;
  closePrice: number;
  position: Position;
} 