import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { socket } from "@/lib/socket";
import type { MarketStore, CoinPrice, ExchangeRate } from "./types";

const useMarketStore = create<MarketStore>()(
  devtools(
    (set) => ({
      upbit: {},
      binance: {},
      exchangeRate: null,
      lastUpdate: Date.now(),

      updateCoinPrice: (data: CoinPrice) =>
        set((state) => {
          const { exchange, baseToken, quoteToken, price, volume, timestamp } =
            data;
          const newState = { ...state };

          // 거래소 객체가 없으면 생성
          if (!newState[exchange][baseToken]) {
            newState[exchange][baseToken] = {};
          }

          // 데이터 업데이트
          newState[exchange][baseToken][quoteToken] = {
            price,
            volume,
            timestamp,
          };

          return {
            ...newState,
            lastUpdate: timestamp,
          };
        }),

      updateExchangeRate: (data: ExchangeRate) =>
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
socket.on("coinPrice", (data: CoinPrice) => {
  // console.log('💾 Updating store with coin price:', data);
  useMarketStore.getState().updateCoinPrice(data);
});

socket.on("exchange-rate", (data: ExchangeRate) => {
  console.log('💾 Updating store with exchange rate:', data);
  useMarketStore.getState().updateExchangeRate(data);
});

// 유용한 selector 함수들
export const useCoinPrice = (
  exchange: 'upbit' | 'binance',
  baseToken: string,
  quoteToken: string
) => {
  return useMarketStore((state) => state[exchange][baseToken][quoteToken]);
};

export const useExchangeRate = () => {
  return useMarketStore((state) => state.exchangeRate);
};

export const useAllCoinPrices = () => {
  return useMarketStore((state) => state.upbit);
};

export default useMarketStore;
