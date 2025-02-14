import { create } from "zustand";
import { ClientAPICall } from "@/lib/axios";
import socket from "@/lib/socket";
import { PredictData, PredictResult } from "@/types/predict";
import useAuthStore from "./useAuthStore";
import { API_ROUTES } from "@/const/api";
interface PredictStats {
  wins: number;
  losses: number;
  draws: number;
  vault: number;
}

interface PredictStore {
  activePredict: PredictData | null;
  lastResult: PredictResult | null;
  isLoading: boolean;
  error: string | null;
  stats: PredictStats | null;

  // Actions
  startPredict: (
    market: string,
    exchange: string,
    position: "L" | "S",
    duration: 15 | 30 | 60 | 180,
    leverage: number,
    deposit: number
  ) => Promise<void>;
  clearError: () => void;
  reset: () => void;
  fetchStats: () => Promise<void>;
}

const usePredictStore = create<PredictStore>((set, get) => ({
  activePredict: null,
  lastResult: null,
  isLoading: false,
  error: null,
  stats: null,

  startPredict: async (market, exchange, position, duration) => {
    try {
      set({ isLoading: true, error: null });

      const response = await ClientAPICall.post(API_ROUTES.PREDICT.POST.url, {
        market,
        exchange,
        position,
        duration,
      });

      if (response.data.success) {
        set({ activePredict: response.data.data });
      } else {
        set({ error: response.data.message });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to start prediction",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set({ activePredict: null, lastResult: null, error: null }),

  fetchStats: async () => {
    try {
      const response = await ClientAPICall.get(API_ROUTES.PREDICT.STATS.url);
      if (response.data.success) {
        set({ stats: response.data.data });
      }
    } catch (error: any) {
      console.error("Failed to fetch predict stats:", error);
    }
  },
}));

// Socket connection setup
const setupPredictSocket = () => {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) return;

  // 기존 리스너 제거
  socket.off(`predict-result-${userId}`);

  socket.on(`predict-result-${userId}`, (result: PredictResult) => {
    console.log("Received predict result:", result);

    // 함수형 업데이트로 변경
    usePredictStore.setState((state) => ({
      ...state,
      lastResult: result,
      activePredict: null,
      stats: result.isDraw
        ? state.stats
        : state.stats
        ? {
            wins: state.stats.wins + (result.isWin ? 1 : 0),
            losses: state.stats.losses + (result.isWin ? 0 : 1),
            draws: state.stats.draws + (result.isDraw ? 1 : 0),
            vault: state.stats.vault,
          }
        : null,
    }));

    // 결과에 따라 stats API 호출
    if (!result.isDraw) {
      usePredictStore.getState().fetchStats();
    }
  });

  // 연결 상태 확인
  socket.on("connect", () => {
    console.log(
      "Socket connected, setting up predict listener for user:",
      userId
    );
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });
};

// 주기적으로 소켓 연결 상태 확인 및 재설정
const checkSocketConnection = () => {
  const userId = useAuthStore.getState().user?.id;
  if (userId && !socket.connected) {
    console.log("Reconnecting socket...");
    socket.connect();
    setupPredictSocket();
  }
};

// 소켓 연결 상태 주기적 체크
setInterval(checkSocketConnection, 5000);

// Setup socket listeners when auth state changes
useAuthStore.subscribe((state) => {
  if (state.isAuthenticated) {
    setupPredictSocket();
  } else {
    // 로그아웃 시 소켓 리스너 정리
    const userId = useAuthStore.getState().user?.id;
    if (userId) {
      socket.off(`predict-result-${userId}`);
    }
  }
});

// 초기 소켓 설정
if (useAuthStore.getState().isAuthenticated) {
  setupPredictSocket();
}

export default usePredictStore;
