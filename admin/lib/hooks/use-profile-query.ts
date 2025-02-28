import { useQuery } from "@tanstack/react-query";
import { API_ROUTE, AdminProfile, payloadMaker } from "../api";
import { useAuth } from "../store/use-auth";
import { useProfile } from "../store/use-profile";
import { authKeys } from "./use-auth-mutation";
import { getCookie } from "cookies-next";
import { fetchWithAuth } from "../fetch";

export function useProfileQuery() {
  const { setIsAuthenticated } = useAuth();
  const { setProfile } = useProfile();

  return useQuery<AdminProfile, Error>({
    queryKey: authKeys.profile,
    queryFn: async () => {
      const accessToken = getCookie("access_token");
      const { url, config } = payloadMaker({
        ...API_ROUTE.ADMIN.GET_PROFILE,
        token: accessToken as string,
      });

      const response = await fetchWithAuth(url, config);

      if (!response.ok) {
        throw new Error("프로필 정보를 가져오는데 실패했습니다");
      }

      const data = await response.json();

      setIsAuthenticated(true);
      setProfile(data);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5분
    retry: false,
  });
}
