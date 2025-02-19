import { Exchange } from "@/types/exchange";

export type Position = "L" | "S";
export type Duration = 15 | 30 | 60 | 180;

export interface PredictData {
  market: string;
  exchange: Exchange;
  createdAt: number;
  price: number;
  position: Position;
  finishedAt: number;
  leverage: number;
  deposit: number;
}

export interface PredictResult {
  isWin: boolean;
  isDraw?: boolean;
  market: string;
  entryPrice: number;
  closePrice: number;
  position: Position;
  leverage: number;
  deposit: number;
  vault: number;
  isLiquidated: boolean;
}
