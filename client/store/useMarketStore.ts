import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { socket } from "@/lib/socket";

interface MarketData {
  price: number;
  volume: number;
  change24h: number;
  timestamp: number;
}

interface CoinData {
  upbit?: MarketData;
  binance?: MarketData;
  bithumb?: MarketData;
  coinone?: MarketData;
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
  // console.log("🟢 coin-premium: ", Object.keys(data).length);
  useMarketStore.getState().updateMarketData(data);
});

socket.on("exchange-rate", (data: { rate: number }) => {
  useMarketStore.getState().updateExchangeRate(data);
});

export const useMarketData = () => {
  return useMarketStore((state) => state.coins);
};

export const useUpbitMarketData = () => {
  return useMarketStore((state) =>
    Object.entries(state.coins).filter((coin) => coin[1].upbit)
  );
};

export const useBinanceMarketData = () => {
  return useMarketStore((state) =>
    Object.entries(state.coins).filter((coin) => coin[1].binance)
  );
};

export const useBithumbMarketData = () => {
  return useMarketStore((state) =>
    Object.entries(state.coins).filter((coin) => coin[1].bithumb)
  );
};

export const useCoinoneMarketData = () => {
  return useMarketStore((state) =>
    Object.entries(state.coins).filter((coin) => coin[1].coinone)
  );
};

export const useExchangeRate = () => {
  return useMarketStore((state) => state.exchangeRate);
};

export default useMarketStore;

export type { CoinData };
