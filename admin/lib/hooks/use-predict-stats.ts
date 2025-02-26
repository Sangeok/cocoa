import { useQuery } from "@tanstack/react-query";
import { API_ROUTE, ApiResponse, payloadMaker } from "../api";
import { useAuth } from "../store/use-auth";
import { fetchWithAuth } from "../fetch";

interface PredictStats {
  totalPredicts: string;
  todayPredicts: string;
  updatedAt: string;
}

export const predictKeys = {
  stats: ["predict", "stats"] as const,
};

export function usePredictStats() {
  const { accessToken, isAuthenticated } = useAuth();

  return useQuery<PredictStats, Error>({
    queryKey: predictKeys.stats,
    queryFn: async () => {
      const { url, config } = payloadMaker({
        ...API_ROUTE.PREDICT.STATISTIC,
      });

      const response = await fetchWithAuth(url, config);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "예측 통계를 가져오는데 실패했습니다"
        );
      }

      const { data } = (await response.json()) as ApiResponse<PredictStats>;
      return data;
    },
    enabled: !!isAuthenticated && !!accessToken,
    refetchInterval: 1000 * 60 * 5, // 5분마다 갱신
  });
}
