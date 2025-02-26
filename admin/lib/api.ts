export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface UpdateAdminDto {
  name?: string;
  phoneNumber?: string;
}

export interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
}

export interface AdminProfile {
  id: number;
  email: string;
  name: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const API_ROUTE = {
  ADMIN: {
    LOGIN: {
      url: "/admin/login",
      method: "POST",
    },
    GET_PROFILE: {
      url: "/admin/profile",
      method: "GET",
    },
    UPDATE_PROFILE: {
      url: "/admin/profile",
      method: "PUT",
    },
    UPDATE_PASSWORD: {
      url: "/admin/password",
      method: "PUT",
    },
    REFRESH_TOKEN: {
      url: "/admin/refresh",
      method: "POST",
    },
    LOGOUT: {
      url: "/admin/logout",
      method: "POST",
    },
    APPROVE_ADMIN: {
      url: "/admin/approve/:id",
      method: "PUT",
    },
  },
  USER: {
    DETAIL_USER: {
      url: "admin/detail/:userId",
      method: "GET",
    },
    USER_LIST: {
      url: "admin/list",
      method: "GET",
    },
    STATISTIC: {
      url: "admin/stats",
      method: "GET",
    },
  },
  PREDICT: {
    STATISTIC: {
      url: "predict/admin/stats",
      method: "GET",
    },
  },
  MESSAGE: {
    CREATE_MESSAGE: {
      url: "message",
      method: "POST",
    },
    LIST_MESSAGE: {
      url: "message/admin",
      method: "GET",
    },
  },
  GUEST_BOOK: {
    STATISTIC: {
      url: "guestbook/admin/stats",
      method: "GET",
    },
  },
  MARKET: {},
  ORDER: {},
  REVIEW: {},
  NOTIFICATION: {},
  SETTING: {},
  STATISTICS: {},
} as const;

export const payloadMaker = ({
  method,
  url,
  body,
  token,
}: {
  method: HttpMethod;
  url: string;
  body?: any;
  token?: string;
}) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  return {
    url: `${BASE_URL}${url}`,
    config,
  };
};