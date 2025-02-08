import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { socket } from "@/lib/socket";

interface MarketData {
  price: number;
  timestamp: number;
  volume: number;
}

interface CoinData {
  upbit?: MarketData;
  binance?: MarketData;
  bithumb?: MarketData;
}

interface MarketStore {
  coins: Record<string, CoinData>;
  exchangeRate: { rate: number } | null;
  lastUpdate: number;
  updateMarketData: (data: Record<string, CoinData>) => void;
  updateExchangeRate: (data: { rate: number }) => void;
}

const useMarketStore = create<MarketStore>()(
  devtools(
    (set) => ({
      coins: {} as Record<string, CoinData>,
      exchangeRate: null,
      lastUpdate: Date.now(),

      updateMarketData: (data) =>
        set((state) => ({
          ...state,
          coins: data,
          lastUpdate: Date.now(),
        })),

      updateExchangeRate: (data) =>
        set((state) => ({
          ...state,
          exchangeRate: data,
          lastUpdate: Date.now(),
        })),
    }),
    {
      name: "market-store",
    }
  )
);

// 웹소켓 리스너 설정
socket.on("coin-premium", (data: Record<string, CoinData>) => {
  useMarketStore.getState().updateMarketData(data);
});

socket.on("exchange-rate", (data: { rate: number }) => {
  useMarketStore.getState().updateExchangeRate(data);
});

export const useMarketData = () => {
  return useMarketStore((state) => state.coins);
};

export const useExchangeRate = () => {
  return useMarketStore((state) => state.exchangeRate);
};

export default useMarketStore;

export type { CoinData };
