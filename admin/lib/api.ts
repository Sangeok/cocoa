export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

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

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
      url: "/user/admin/detail/:userId",
      method: "GET",
    },
    USER_LIST: {
      url: "/user/admin/list",
      method: "GET",
    },
    STATISTIC: {
      url: "/user/admin/stats",
      method: "GET",
    },
  },
  PREDICT: {
    STATISTIC: {
      url: "/predict/admin/stats",
      method: "GET",
    },
  },
  MESSAGE: {
    LIST_MESSAGE: {
      url: "/messages/admin/:userId",
      method: "GET",
    },
    CREATE_MESSAGE: {
      url: "/messages",
      method: "POST",
    },
  },
  GUEST_BOOK: {
    STATISTIC: {
      url: "guestbook/admin/stats",
      method: "GET",
    },
  },
  BANNER: {
    LIST: {
      url: "/banners",
      method: "GET",
    },
    DETAIL: {
      url: "/banners/:id",
      method: "GET",
    },
    APPROVE: {
      url: "/banners/:id/approve",
      method: "POST",
    },
    DELETE: {
      url: "/banners/:id",
      method: "DELETE",
    },
    UPDATE: {
      url: "/banners/:id",
      method: "PATCH",
    },
    UPDATE_IMAGE: {
      url: "/banners/:id/image",
      method: "POST",
    },
    ITEMS: {
      LIST: {
        url: "/banners/items",
        method: "GET",
      },
      CREATE: {
        url: "/banners/items",
        method: "POST",
      },
      DEACTIVATE: {
        url: "/banners/items/:id/deactivate",
        method: "POST",
      },
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
  params,
}: {
  method: HttpMethod;
  url: string;
  body?: any;
  token?: string;
  params?: Record<string, string>;
}) => {
  const headers: HeadersInit = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    const accessToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token="))
      ?.split("=")[1];

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  // URL 파라미터 처리
  let finalUrl = url;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      finalUrl = finalUrl.replace(`:${key}`, value);
    });
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  if (body && method !== "GET") {
    if (!(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
      config.body = JSON.stringify(body);
    } else {
      config.body = body;
    }
  }

  return {
    url: `${BASE_URL}${finalUrl}`,
    config,
  };
};

export interface Banner {
  id: number;
  userId: number;
  bannerItemId: number;
  imageUrl: string;
  forwardUrl: string;
  startAt: string;
  endAt: string;
  amount: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BannerItem {
  id: number;
  routePath: string;
  previewImageUrl: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  position: 'top' | 'middle' | 'bottom';
  recommendedImageSize: string;
  pricePerDay: string;
  cocoaMoneyPerDay: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
