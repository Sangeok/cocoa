import { create } from 'zustand';
import { socket } from '@/lib/socket';

interface LongShortRatio {
  long: number;
  short: number;
  total: number;
  longPercent: number;
  shortPercent: number;
}

interface MarketRatio extends LongShortRatio {
  market: string;
}

interface LongShortStore {
  globalRatio: LongShortRatio;
  marketRatios: Record<string, LongShortRatio>;
  setGlobalRatio: (ratio: LongShortRatio) => void;
  setMarketRatio: (market: string, ratio: LongShortRatio) => void;
  initializeSocket: () => void;
}

const defaultRatio: LongShortRatio = {
  long: 0,
  short: 0,
  total: 0,
  longPercent: 0,
  shortPercent: 0,
};

const useLongShortStore = create<LongShortStore>((set) => ({
  globalRatio: defaultRatio,
  marketRatios: {},
  
  setGlobalRatio: (ratio) => set({ globalRatio: ratio }),
  
  setMarketRatio: (market, ratio) => 
    set((state) => ({
      marketRatios: {
        ...state.marketRatios,
        [market]: ratio,
      },
    })),

  initializeSocket: () => {
    // 전체 롱숏 비율 수신
    socket.on('global-long-short-ratio', (data: LongShortRatio) => {
      set({ globalRatio: data });
    });

    // 마켓별 롱숏 비율 수신
    socket.on('market-long-short-ratios', (data: MarketRatio[]) => {
      const newMarketRatios = data.reduce((acc, ratio) => {
        const { market, ...ratioData } = ratio;
        acc[market] = ratioData;
        return acc;
      }, {} as Record<string, LongShortRatio>);

      set({ marketRatios: newMarketRatios });
    });
  },
}));

export default useLongShortStore;
