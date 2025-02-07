import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { socket } from '@/lib/socket';
import type { MarketState, CoinPrice, ExchangeRate } from './types';
import { TickerData } from '@/types/common';

interface MarketStore extends MarketState {
  updateCoinPrice: (data: CoinPrice) => void;
  updateExchangeRate: (data: ExchangeRate) => void;
  setTicker: (exchange: string, baseToken: string, quoteToken: string, data: TickerData) => void;
}

const useMarketStore = create<MarketStore>()(
  devtools(
    (set) => ({
      coinPrices: {},
      exchangeRate: null,
      lastUpdate: Date.now(),
      tickers: {},

      updateCoinPrice: (data: CoinPrice) =>
        set((state) => ({
          coinPrices: {
            ...state.coinPrices,
            [data.symbol]: data,
          },
          lastUpdate: Date.now(),
        })),

      updateExchangeRate: (data: ExchangeRate) =>
        set(() => ({
          exchangeRate: data,
          lastUpdate: Date.now(),
        })),

      setTicker: (exchange, baseToken, quoteToken, data) =>
        set((state) => ({
          tickers: {
            ...state.tickers,
            [`${exchange}-${baseToken}-${quoteToken}`]: data,
          },
        })),
    }),
    {
      name: 'market-store',
    }
  )
);

// 웹소켓 리스너 설정
socket.on('coin-price', (data: CoinPrice) => {
  useMarketStore.getState().updateCoinPrice(data);
});

socket.on('exchange-rate', (data: ExchangeRate) => {
  useMarketStore.getState().updateExchangeRate(data);
});

// 유용한 selector 함수들
export const useCoinPrice = (symbol: string) => {
  return useMarketStore((state) => state.coinPrices[symbol]);
};

export const useExchangeRate = () => {
  return useMarketStore((state) => state.exchangeRate);
};

export const useAllCoinPrices = () => {
  return useMarketStore((state) => state.coinPrices);
};

export default useMarketStore; 