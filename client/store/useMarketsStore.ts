import { create } from "zustand";
import { ClientAPICall } from "@/lib/axios";
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
  fetchMarkets: () => Promise<MarketsStore["markets"]>;
  getKoreanName: (symbol: string) => string;
}

const useMarketsStore = create<MarketsStore>()((set, get) => ({
  markets: null,
  isLoading: false,
  error: null,

  fetchMarkets: async (): Promise<MarketsStore["markets"]> => {
    // 이미 markets 데이터가 있으면 스킵
    if (get().markets) {
      console.log("Already have markets data, skipping fetch");
      return get().markets;
    }

    try {
      set({ isLoading: true, error: null });
      const { data } = await ClientAPICall.get(API_ROUTES.EXCHANGE.MARKETS.url);

      // 데이터 유효성 검증 강화
      if (!data || !data.upbit || !data.bithumb || !data.binance) {
        console.error("Invalid markets data:", data);
        throw new Error("Invalid markets data received");
      }

      set({
        markets: data,
        isLoading: false,
        error: null,
      });

      return data;
    } catch (error) {
      console.error("Failed to fetch markets:", error);
      set({
        error: "Failed to fetch markets",
        isLoading: false,
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

    const upbitMarket = markets.upbit.find((m) => m.market === marketKey);
    const bithumbMarket = markets.bithumb.find((m) => m.market === marketKey);

    return upbitMarket?.koreanName || bithumbMarket?.koreanName || "";
  },
}));

// 초기 마켓 데이터 로드
useMarketsStore.getState().fetchMarkets();

export default useMarketsStore;
