import { useQuery } from "@tanstack/react-query";
import { API_ROUTE, ApiResponse, payloadMaker } from "../api";
import { useAuth } from "../store/use-auth";
import { fetchWithAuth } from "../fetch";

interface UserDetail {
  id: number;
  name: string;
  email: string;
  provider: string;
  phoneNumber: string;
  telegram: string;
  youtube: string;
  instagram: string;
  twitter: string;
  discord: string;
  homepage: string;
  github: string;
  bio: string;
  createdAt: string;
}

export const userKeys = {
  detail: (id: string) => ["users", "detail", id] as const,
};

export function useUserDetail(id: string) {
  const { accessToken, isAuthenticated } = useAuth();

  return useQuery<UserDetail, Error>({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const { url, config } = payloadMaker({
        ...API_ROUTE.USER.DETAIL_USER,
        params: { userId: id },
        token: accessToken || undefined,
      });

      const response = await fetchWithAuth(url, config);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "사용자 정보를 가져오는데 실패했습니다");
      }

      const { data } = (await response.json()) as ApiResponse<UserDetail>;
      
      if (!data) {
        throw new Error("사용자 정보를 찾을 수 없습니다");
      }

      return data;
    },
    enabled: !!isAuthenticated && !!accessToken && !!id,
  });
} 