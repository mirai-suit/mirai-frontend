import { LoginInput, UserInput } from "../validations";
import { useAuthStore } from "../store";

import apiClient from "@/libs/axios/interceptor";

export const authService = {
  // Sign up method
  async signup(userData: UserInput) {
    const response = await apiClient.post("/auth/signup", userData);

    return response.data;
  },

  // Login method
  async login(credentials: LoginInput) {
    const response = await apiClient.post("/auth/login", credentials);

    return response.data;
  },

  // Logout method
  async logout() {
    try {
      // Call the logout API to revoke all tokens on the server
      await apiClient.post("/auth/logout");
    } catch {
      // Handle logout error silently - still clear local state
    } finally {
      // Clear auth state regardless of API response
      useAuthStore.getState().clearAuth();
    }
  },

  // Refresh token method
  async refreshToken(token: string) {
    const response = await apiClient.post("/auth/refresh-token", { refreshToken: token });

    if (response.data && response.data.accessToken) {
      useAuthStore.getState().setAccessToken(response.data.accessToken);
    }

    return response.data;
  },
};
