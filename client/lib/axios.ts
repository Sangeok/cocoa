import axios from "axios";
import { API_ROUTES } from "@/const/api";
const CLIENT_API_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
const SERVER_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const SCAMSCANNER_API_URL = "https://api.scamscanner.info/api";

export const ClientAPICall = axios.create({
  baseURL: CLIENT_API_URL + "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

ClientAPICall.interceptors.request.use((config) => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("access_token="))
    ?.split("=")[1];

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

export const ServerAPICall = axios.create({
  baseURL: SERVER_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

ServerAPICall.interceptors.request.use((config) => {
  config.withCredentials = true;

  const token =
    typeof document !== "undefined"
      ? document.cookie
          .split("; ")
          .find((row) => row.startsWith("access_token="))
          ?.split("=")[1]
      : null;

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  // URL이 /scamscanner로 시작하는 경우 baseURL 변경
  if (config.url?.startsWith("/scamscanner/")) {
    config.baseURL = SCAMSCANNER_API_URL;
    config.url = config.url.substring("/scamscanner/".length);
  } else {
    config.baseURL = SERVER_API_URL;
  }

  return config;
});

// Refresh token 요청을 위한 함수
const refreshAccessToken = async () => {
  try {
    const refreshToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("refresh_token="))
      ?.split("=")[1];

    if (!refreshToken) throw new Error("No refresh token");

    const response = await axios.post(
      `${SERVER_API_URL}/auth/refresh`,
      { refreshToken },
      { withCredentials: true }
    );

    return response.data.accessToken;
  } catch (error) {
    window.location.href = '/signin';
    throw error;
  }
};

// Response interceptor 수정
ServerAPICall.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return ServerAPICall(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);
