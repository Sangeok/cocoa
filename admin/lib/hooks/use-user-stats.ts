import { useQuery } from "@tanstack/react-query";
import { API_ROUTE, ApiResponse, payloadMaker } from "../api";
import { useAuth } from "../store/use-auth";

interface UserStats {
  totalUsers: number;
  todayUsers: number;
  updatedAt: string;
}

export const userKeys = {
  stats: ['user', 'stats'] as const,
}

export function useUserStats() {
  const { accessToken } = useAuth();

  return useQuery<UserStats, Error>({
    queryKey: userKeys.stats,
    queryFn: async () => {
      const { url, config } = payloadMaker({
        ...API_ROUTE.USER.STATISTIC,
        token: accessToken!,
      });

      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error("사용자 통계를 가져오는데 실패했습니다");
      }

      const { data } = (await response.json()) as ApiResponse<UserStats>;
      return data;
    },
    enabled: !!accessToken,
    refetchInterval: 1000 * 60 * 5, // 5분마다 갱신
  });
} 