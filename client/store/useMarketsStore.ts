import { create } from "zustand";
import { apiClient } from "@/lib/axios";
import { API_ROUTES } from "@/const/api";

export interface KoreanMarket {
  market: string;
  koreanName: string;
  englishName: string;
  marketWarning: string;
}

interface BinanceMarket {
  symbol: string;
  baseToken: string;
  quoteToken: string;
}

interface MarketsStore {
  markets: {
    upbit: KoreanMarket[];
    bithumb: KoreanMarket[];
    binance: BinanceMarket[];
  } | null;
  isLoading: boolean;
  error: string | null;
  fetchMarkets: () => Promise<void>;
  getKoreanName: (symbol: string) => string;
}

const useMarketsStore = create<MarketsStore>()((set, get) => ({
  markets: null,
  isLoading: false,
  error: null,

  fetchMarkets: async () => {
    try {
      // 이미 데이터가 있으면 바로 반환
      if (get().markets) {
        return;
      }

      set({ isLoading: true, error: null });
      const { data } = await apiClient.get(API_ROUTES.EXCHANGE.MARKETS.url);
      
      // 데이터 유효성 검증
      if (!data || !data.upbit || !data.bithumb || !data.binance) {
        throw new Error('Invalid markets data received');
      }

      set({ markets: data, isLoading: false });
      return data; // 데이터 반환 추가
    } catch (error) {
      console.error('Failed to fetch markets:', error);
      set({ error: 'Failed to fetch markets', isLoading: false });
      throw error; // 에러를 다시 throw
    }
  },

  getKoreanName: (symbol: string) => {
    const markets = get().markets;
    // console.log(markets?.upbit);
    if (!markets) return symbol;

    const [baseToken, quoteToken] = symbol.split("-");
    const marketKey = `${quoteToken}-${baseToken}`;

    const upbitMarket = markets.upbit.find(m => m.market === marketKey);
    const bithumbMarket = markets.bithumb.find(m => m.market === marketKey);

    return upbitMarket?.koreanName || bithumbMarket?.koreanName || "";
  },
}));

export default useMarketsStore; 