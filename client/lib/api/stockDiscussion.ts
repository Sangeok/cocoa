import { ClientAPICall } from '../axios';
import { API_ROUTES } from '@/const/api';

interface Discussion {
  id: number;
  content: string;
  symbol: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    name: string;
  };
  commentCount: number;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
  mentionedUser?: {
    id: number;
    name: string;
  };
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const stockDiscussionAPI = {
  // 토론 목록 조회
  getDiscussions: async (symbol: string, page: number = 1, limit: number = 20) => {
    const response = await ClientAPICall.get<{
      success: boolean;
      data: PaginatedResponse<Discussion>;
    }>(API_ROUTES.STOCK_DISCUSSION.LIST.url, {
      params: { symbol, page, limit },
    });
    return response.data;
  },

  // 토론 생성
  createDiscussion: async (symbol: string, content: string) => {
    const response = await ClientAPICall.post<{
      success: boolean;
      data: Discussion;
    }>(API_ROUTES.STOCK_DISCUSSION.CREATE.url, {
      symbol,
      content,
    });
    return response.data;
  },

  // 토론 삭제
  deleteDiscussion: async (discussionId: number) => {
    const response = await ClientAPICall.delete<{
      success: boolean;
      data: { success: boolean };
    }>(API_ROUTES.STOCK_DISCUSSION.DELETE.url.replace(':discussionId', discussionId.toString()));
    return response.data;
  },

  // 댓글 목록 조회
  getComments: async (discussionId: number, page: number = 1, limit: number = 20) => {
    const response = await ClientAPICall.get<{
      success: boolean;
      data: PaginatedResponse<Comment>;
    }>(API_ROUTES.STOCK_DISCUSSION.GET_COMMENTS.url.replace(':discussionId', discussionId.toString()), {
      params: { page, limit },
    });
    return response.data;
  },

  // 댓글 생성
  createComment: async (discussionId: number, content: string) => {
    const response = await ClientAPICall.post<{
      success: boolean;
      data: Comment;
    }>(
      API_ROUTES.STOCK_DISCUSSION.CREATE_COMMENT.url.replace(':discussionId', discussionId.toString()),
      { content }
    );
    return response.data;
  },

  // 댓글 수정
  updateComment: async (commentId: number, content: string) => {
    const response = await ClientAPICall.patch<{
      success: boolean;
      data: Comment;
    }>(
      API_ROUTES.STOCK_DISCUSSION.UPDATE_COMMENT.url.replace(':commentId', commentId.toString()),
      { content }
    );
    return response.data;
  },

  // 댓글 삭제
  deleteComment: async (commentId: number) => {
    const response = await ClientAPICall.delete<{
      success: boolean;
      data: { success: boolean };
    }>(API_ROUTES.STOCK_DISCUSSION.DELETE_COMMENT.url.replace(':commentId', commentId.toString()));
    return response.data;
  },
}; 