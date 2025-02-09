import { create } from "zustand";
import { apiClient } from "@/lib/axios";
import { API_ROUTES } from "@/const/api";

interface Market {
  market: string;
  koreanName: string;
  englishName: string;
  marketWarning: string;
}

interface MarketsStore {
  markets: {
    upbit: Market[];
    bithumb: Market[];
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
    // 이미 데이터가 있거나 로딩 중이면 중복 요청 방지
    if (get().markets || get().isLoading) return;

    try {
      set({ isLoading: true, error: null });
      const { data } = await apiClient.get(API_ROUTES.EXCHANGE.MARKETS.url);
      set({ markets: data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch markets:', error);
      set({ error: 'Failed to fetch markets', isLoading: false });
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