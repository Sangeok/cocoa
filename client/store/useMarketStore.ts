import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { socket } from "@/lib/socket";
import { ClientAPICall } from "@/lib/axios";
import { API_ROUTES } from "@/const/api";

interface MarketData {
  price: number;
  volume: number;
  change24h: number;
  timestamp: number;
}

export interface CoinData {
  upbit?: MarketData;
  binance?: MarketData;
  bithumb?: MarketData;
  coinone?: MarketData;
  okx?: MarketData;
}

interface MarketStore {
  coins: Record<string, CoinData>;
  exchangeRate: { rate: number } | null;
  lastUpdate: number;
  updateMarketData: (data: Record<string, CoinData>) => void;
  updateExchangeRate: (data: { rate: number }) => void;
  fetchExchangeRate: () => Promise<number>;
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

      fetchExchangeRate: async (): Promise<number> => {
        try {
          const { data } = await ClientAPICall.get(
            API_ROUTES.EXCHANGE.USD_PRICE.url
          );
          set((state) => ({
            ...state,
            exchangeRate: { rate: data },
            lastUpdate: Date.now(),
          }));

          return data.rate;
        } catch (error) {
          console.error("Failed to fetch exchange rate:", error);
          return 0;
        }
      },
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

// 60초마다 환율 업데이트 (웹소켓)
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