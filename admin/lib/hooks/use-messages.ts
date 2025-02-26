import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ROUTE, ApiResponse, payloadMaker } from "../api";
import { fetchWithAuth } from "../fetch";

interface Message {
  message: {
    id: number;
    title: string;
    content: string;
    isRead: boolean;
    createdAt: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface MessageListResponse {
  messages: Message[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface CreateMessageDto {
  userId: number;
  title: string;
  content: string;
}

export const messageKeys = {
  list: (userId?: string | number) => ["messages", { userId }] as const,
};

export function useMessages(userId?: string | number) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<MessageListResponse>({
    queryKey: messageKeys.list(userId),
    queryFn: async () => {
      const parsedUserId = userId ? Number(userId) : undefined;
      if (!parsedUserId || isNaN(parsedUserId)) {
        throw new Error("유효하지 않은 사용자 ID입니다");
      }

      const { url, config } = payloadMaker({
        ...API_ROUTE.MESSAGE.LIST_MESSAGE,
        params: {
          userId: parsedUserId.toString(),
        },
      });

      const response = await fetchWithAuth(url, config);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "메시지 목록을 가져오는데 실패했습니다"
        );
      }

      const result = await response.json();
      console.log("Server raw response:", result);

      if (!result.success || !result.data) {
        return {
          messages: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          },
        };
      }

      return result.data;
    },
    enabled: !!userId && !isNaN(Number(userId)),
  });

  const createMessage = useMutation({
    mutationFn: async (newMessage: CreateMessageDto) => {
      const { url, config } = payloadMaker({
        ...API_ROUTE.MESSAGE.CREATE_MESSAGE,
        body: newMessage,
      });

      const response = await fetchWithAuth(url, config);
      if (!response.ok) {
        throw new Error("메시지 전송에 실패했습니다");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.list(userId),
      });
    },
  });

  return {
    messages: data?.messages ?? [],
    pagination: data?.pagination,
    isLoading,
    createMessage,
  };
}
