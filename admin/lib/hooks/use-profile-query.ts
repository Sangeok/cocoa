import { useQuery } from "@tanstack/react-query";
import { API_ROUTE, AdminProfile, ApiResponse, payloadMaker } from "../api";
import { useAuth } from "../store/use-auth";
import { useProfile } from "../store/use-profile";
import { authKeys } from "./use-auth-mutation";

export function useProfileQuery() {
  const { accessToken, isAuthenticated } = useAuth();
  const { setProfile } = useProfile();

  return useQuery<AdminProfile, Error>({
    queryKey: authKeys.profile,
    queryFn: async () => {
      const { url, config } = payloadMaker({
        ...API_ROUTE.ADMIN.GET_PROFILE,
        token: accessToken || undefined,
      });

      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error("프로필 정보를 가져오는데 실패했습니다");
      }

      const data = await response.json();
      setProfile(data);
      return data;
    },
    enabled: !!isAuthenticated && !!accessToken,
    staleTime: 1000 * 60 * 5, // 5분
    retry: false,
  });
}
