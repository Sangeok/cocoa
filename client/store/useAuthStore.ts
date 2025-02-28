import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ClientAPICall } from "@/lib/axios";
import { deleteCookie } from "cookies-next/client";

interface User {
  id: number;
  email: string;
  name: string;
  provider: string;
  phoneNumber: string;
  createdAt: string;
  bio: string;
  telegram: string;
  youtube: string;
  instagram: string;
  twitter: string;
  discord: string;
  homepage: string;
  github: string;
  predict: {
    wins: number;
    losses: number;
    draws: number;
    vault: number;
    lastPredictAt: string;
    lastCheckInAt: string;
  };
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  refreshToken: string | null;
  setUser: (user: User | null) => void;
  setTokens: (refreshToken: string) => void;
  logout: () => void;
  updateVault: (newVault: number) => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      refreshToken: null,
      setUser: (user) => {
        if (!user) {
          return set({
            user: null,
            isAuthenticated: false,
          });
        }

        return set({
          user: {
            ...user,
            id: user?.id || 0,
            email: user?.email || "",
            provider: user?.provider || "",
            phoneNumber: user?.phoneNumber || "",
            name: user?.name || "",
            bio: user?.bio || "",
            telegram: user?.telegram || "",
            youtube: user?.youtube || "",
            instagram: user?.instagram || "",
            twitter: user?.twitter || "",
            discord: user?.discord || "",
            homepage: user?.homepage || "",
            github: user?.github || "",
            predict: {
              ...user?.predict,
              lastCheckInAt: user?.predict?.lastCheckInAt || "",
              wins: user?.predict?.wins || 0,
              losses: user?.predict?.losses || 0,
              draws: user?.predict?.draws || 0,
              vault: user?.predict?.vault || 10000,
              lastPredictAt: user?.predict?.lastPredictAt || "",
            },
          },
          isAuthenticated: !!user,
        });
      },
      setTokens: (refreshToken) =>
        set({
          refreshToken,
        }),
      logout: async () => {
        set({
          user: null,
          isAuthenticated: false,
          refreshToken: null,
        });

        deleteCookie("cocoa_access_token");
        deleteCookie("cocoa_refresh_token");
      },
      updateVault: (newVault) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                predict: {
                  ...state.user.predict,
                  vault: newVault,
                },
              }
            : null,
        })),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

export default useAuthStore;
