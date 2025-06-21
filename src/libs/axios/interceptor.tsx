import { useAuthStore } from "@/modules/auth/store";
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

let isRefreshing = false;
let failedQueue: { resolve: Function; reject: Function }[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((request) => {
    error ? request.reject(error) : request.resolve(token);
  });
  failedQueue = [];
};

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor — add access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor — handle 401 + retry
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and not retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if this is a token-related issue vs credential issue
      const errorMessage = (error.response?.data as any)?.message || "";
      const isTokenRelated =
        errorMessage.toLowerCase().includes("token") ||
        errorMessage.toLowerCase().includes("expired") ||
        errorMessage.toLowerCase().includes("invalid token") ||
        errorMessage.toLowerCase().includes("unauthorized token") ||
        errorMessage.toLowerCase().includes("malformed");

      // Only trigger refresh logic for token-related 401 errors
      if (!isTokenRelated) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue the failed request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;

            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // 🔁 Retry token refresh up to 5 times
        const MAX_RETRIES = 5;
        let attempt = 0;
        let response;

        while (attempt < MAX_RETRIES) {
          try {
            response = await axios.post(
              `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/auth/refresh-token`,
              { refreshToken }
            );
            break; // success
          } catch (err) {
            attempt++;
            if (attempt >= MAX_RETRIES) throw err;
            await new Promise((res) => setTimeout(res, 2000)); // delay 1s
          }
        }

        const { accessToken, refreshToken: newRefreshToken } =
          response?.data.data;

        // ✅ Update tokens in store
        const user = useAuthStore.getState().user;

        useAuthStore.getState().setAuth(user, accessToken, newRefreshToken);

        // ✅ Retry original request with new access token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(new Error("Failed to refresh token"));
        useAuthStore.getState().clearAuth();
        window.location.href = "/auth/login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
