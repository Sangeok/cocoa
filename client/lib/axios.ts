import axios from "axios";

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
  if (config.url?.startsWith('/scamscanner/')) {
    config.baseURL = SCAMSCANNER_API_URL;
    config.url = config.url.substring('/scamscanner/'.length);
  } else {
    config.baseURL = SERVER_API_URL;
  }

  return config;
});
