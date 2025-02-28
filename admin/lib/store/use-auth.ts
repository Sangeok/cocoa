import { create } from "zustand";
import { persist } from "zustand/middleware";
import { deleteCookie } from "cookies-next/client";
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (tokens: {
    accessToken: string;
    refreshToken: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  setAccessToken: (accessToken: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: async (tokens) => {
        await Promise.resolve(); // 상태 업데이트를 다음 틱으로
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        });
      },
      logout: async () => {
        await Promise.resolve();
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        deleteCookie("access_token");
        deleteCookie("refresh_token");
      },
      setAccessToken: (accessToken) => set({ accessToken }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
    }),
    {
      name: "auth-storage",
    }
  )
);
