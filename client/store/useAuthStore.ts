import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  email: string;
  name: string;
  provider: string;
  phoneNumber: string;
  createdAt: string;
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
  setUser: (user: User | null) => void;
  logout: () => void;
  updateVault: (newVault: number) => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
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
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
      updateVault: (newVault) => 
        set((state) => ({
          user: state.user ? {
            ...state.user,
            predict: {
              ...state.user.predict,
              vault: newVault,
            },
          } : null,
        })),
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;
