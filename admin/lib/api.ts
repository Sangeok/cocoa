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
  },
  USER: {
    // 추후 사용자 관련 API 라우트 추가
  },
  PRODUCT: {
    // 추후 상품 관련 API 라우트 추가
  },
  ORDER: {
    // 추후 주문 관련 API 라우트 추가
  },
  REVIEW: {
    // 추후 리뷰 관련 API 라우트 추가
  },
  NOTIFICATION: {
    // 추후 알림 관련 API 라우트 추가
  },
  SETTING: {
    // 추후 설정 관련 API 라우트 추가
  },
  STATISTICS: {
    // 추후 통계 관련 API 라우트 추가
  },
} as const;
