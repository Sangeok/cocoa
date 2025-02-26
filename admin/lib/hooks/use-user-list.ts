import { useQuery } from "@tanstack/react-query";
import { API_ROUTE, ApiResponse, payloadMaker } from "../api";
import { useAuth } from "../store/use-auth";
import { fetchWithAuth } from "../fetch";

interface User {
  id: number;
  name: string;
  email: string;
  provider: string;
  createdAt: string;
}

interface Pagination {
  total: string;
  page: number;
  limit: number;
  totalPages: number;
}

interface UserListResponse {
  users: User[];
  pagination: Pagination;
}

export const userKeys = {
  list: (page: number) => ["users", "list", page] as const,
};

export function useUserList(page: number = 1) {
  const { accessToken, isAuthenticated } = useAuth();

  return useQuery<UserListResponse, Error>({
    queryKey: userKeys.list(page),
    queryFn: async () => {
      const { url, config } = payloadMaker({
        ...API_ROUTE.USER.USER_LIST,
        body: { page: page.toString(), limit: "10" },
      });

      const response = await fetchWithAuth(url, config);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "사용자 목록을 가져오는데 실패했습니다"
        );
      }

      const { data } = (await response.json()) as ApiResponse<UserListResponse>;
      return data;
    },
    enabled: !!isAuthenticated && !!accessToken,
  });
}
