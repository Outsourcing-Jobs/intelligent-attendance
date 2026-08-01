import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { authService } from "@/services/auth.service";
import type { LoginDto, LoginResponse, UserProfile } from "@/types/auth.types";

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  refreshToken: string | null;
  menus: any[];
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (credentials: LoginDto) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  setAuthData: (data: { user?: UserProfile; token?: string; refreshToken?: string; menus?: any[] }) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      menus: [],
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginDto) => {
        set({ isLoading: true });
        try {
          const response = await authService.login(credentials);
          const token = response.idToken || response.accessToken || response.customToken || null;
          const refreshToken = response.refreshToken || null;
          const user = response.user || null;
          const menus = response.menus || [];

          if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user_profile");
          }
          if (token && typeof window !== "undefined") {
            localStorage.setItem("access_token", token);
          }
          if (refreshToken && typeof window !== "undefined") {
            localStorage.setItem("refresh_token", refreshToken);
          }

          set({
            user,
            token,
            refreshToken,
            menus,
            isAuthenticated: Boolean(token),
            isLoading: false,
          });

          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout().catch(() => {});
        } finally {
          if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user_profile");
          }
          set({
            user: null,
            token: null,
            refreshToken: null,
            menus: [],
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      setUser: (user) => set({ user }),

      setAuthData: (data) =>
        set((state) => ({
          user: data.user !== undefined ? data.user : state.user,
          token: data.token !== undefined ? data.token : state.token,
          refreshToken: data.refreshToken !== undefined ? data.refreshToken : state.refreshToken,
          menus: data.menus !== undefined ? data.menus : state.menus,
          isAuthenticated: Boolean(data.token !== undefined ? data.token : state.token),
        })),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        menus: state.menus,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
