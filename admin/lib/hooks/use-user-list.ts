import { useQuery } from "@tanstack/react-query";
import { API_ROUTE, ApiResponse, payloadMaker } from "../api";
import { useAuth } from "../store/use-auth";
import { fetchWithAuth } from "../fetch";
import { useDebounce } from "react-haiku";

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
  list: (page: number, search?: string) => ["users", "list", page, search] as const,
};

export function useUserList(page: number = 1, search?: string) {
  const { accessToken, isAuthenticated } = useAuth();
  const debouncedSearch = useDebounce(search, 300);

  return useQuery<UserListResponse, Error>({
    queryKey: userKeys.list(page, debouncedSearch),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('page', page.toString());
      searchParams.append('limit', '10');
      if (debouncedSearch) {
        searchParams.append('search', debouncedSearch);
      }

      const { url, config } = payloadMaker({
        ...API_ROUTE.USER.USER_LIST,
        url: `${API_ROUTE.USER.USER_LIST.url}?${searchParams.toString()}`,
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
