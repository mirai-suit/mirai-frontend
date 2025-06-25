import { create } from "zustand";
import { persist } from "zustand/middleware";

import { User } from "../types";

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
};

type AuthActions = {
  setAuth: (
    user: User | null,
    accessToken: string | null,
    refreshToken: string | null,
  ) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  setAccessToken: (token: string) => void;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,
      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: !!user && !!accessToken,
        });
      },

      setUser: (user) =>
        set((state) => ({
          ...state,
          user,
        })),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      setAccessToken: (accessToken) =>
        set((state) => ({
          ...state,
          accessToken,
        })),
    }),
    {
      name: "mirai-auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
