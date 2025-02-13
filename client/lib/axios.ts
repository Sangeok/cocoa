import axios from "axios";

const CLIENT_API_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
const SERVER_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
  credentials: 'include'
});
