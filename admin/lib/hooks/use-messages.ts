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
  list: (userId?: number) => ["messages", { userId }] as const,
};

export function useMessages(userId?: number) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<MessageListResponse>({
    queryKey: messageKeys.list(userId),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (userId) searchParams.append("userId", userId.toString());

      const { url, config } = payloadMaker({
        ...API_ROUTE.MESSAGE.LIST_MESSAGE,
        url: `${API_ROUTE.MESSAGE.LIST_MESSAGE.url}?${searchParams.toString()}`,
      });

      const response = await fetchWithAuth(url, config);
      if (!response.ok) {
        throw new Error("메시지 목록을 가져오는데 실패했습니다");
      }

      const { data } = await response.json();
      return data;
    },
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
      queryClient.invalidateQueries(messageKeys.list(userId));
    },
  });

  return {
    messages: data?.messages ?? [],
    pagination: data?.pagination,
    isLoading,
    createMessage,
  };
} 