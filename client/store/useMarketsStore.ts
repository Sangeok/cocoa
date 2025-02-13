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
    // 이미 로딩 중이면 중복 요청 방지
    if (get().isLoading) {
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const { data } = await apiClient.get(API_ROUTES.EXCHANGE.MARKETS.url);
      
      // 데이터 유효성 검증 강화
      if (!data || !data.upbit || !data.bithumb || !data.binance) {
        console.error('Invalid markets data:', data);
        throw new Error('Invalid markets data received');
      }

      set({ 
        markets: data, 
        isLoading: false,
        error: null 
      });
      
      return data;
    } catch (error) {
      console.error('Failed to fetch markets:', error);
      set({ 
        error: 'Failed to fetch markets', 
        isLoading: false 
      });
      throw error;
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