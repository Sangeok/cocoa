import axios from "axios";
import { getCookie } from "cookies-next";
const CLIENT_API_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
const SERVER_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const SCAMSCANNER_API_URL = "https://api.scamscanner.info/api";

// 쿠키에서 토큰을 가져오는 유틸리티 함수
const getTokenFromCookie = (
  tokenName: string,
  cookieHeader?: string
): string | null => {
  if (typeof window === "undefined") {
    // 서버 사이드에서는 전달받은 쿠키 헤더 사용
    return (
      cookieHeader
        ?.split("; ")
        .find((row) => row.startsWith(`${tokenName}=`))
        ?.split("=")[1] || null
    );
  }

  // 클라이언트 사이드
  return getCookie(tokenName) as string | null;
};

// 서버 사이드에서 실행되는지 확인하는 함수
const isServer = () => typeof window === "undefined";

// ClientAPICall은 route.ts를 통해 서버와 통신
export const ClientAPICall = axios.create({
  baseURL: CLIENT_API_URL + "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// DirectAPICall은 서버와 직접 통신 (리프레시용)
export const DirectAPICall = axios.create({
  baseURL: SERVER_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

ClientAPICall.interceptors.request.use((config) => {
  if (!isServer()) {
    const token = getTokenFromCookie("access_token");
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return config;
});

// ClientAPICall 인터셉터 (route.ts를 통한 요청)
ClientAPICall.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.data?.error === "Unauthorized") {
      const refreshToken = error.config.headers["X-Refresh-Token"];
      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        // 직접 서버에 리프레시 요청
        const response = await axios.post(
          `${SERVER_API_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        const { accessToken } = response.data.data;
        document.cookie = `access_token=${accessToken}; path=/`;

        // 원래 요청 재시도
        return ClientAPICall(error.config);
      } catch (refreshError) {
        window.location.href = "/signin";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const ServerAPICall = axios.create({
  baseURL: SERVER_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

ServerAPICall.interceptors.request.use((config) => {
  if (config.url?.startsWith("/scamscanner/")) {
    config.baseURL = SCAMSCANNER_API_URL;
    config.url = config.url.substring("/scamscanner/".length);
  }

  return config;
});
