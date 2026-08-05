import axios from "axios";//
import { store } from "../store";
import { clearAuth } from "../store/authSlice";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://projectbackend-production-eaca.up.railway.app";

/**
 * Normalized API error parser.
 */
export const parseError = (error) => {
  let message = "An unexpected error occurred.";
  let status = error.response?.status || 500;
  let errors = error.response?.data?.errors || null;

  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      message = "Connection timed out. Please try again.";
      status = 408;
    } else {
      message = "Network connection failure. Please verify your internet connection.";
      status = 0;
    }
  } else {
    message = error.response?.data?.message || message;
  }

  return { message, status, errors, originalError: error };
};

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000, // 15s timeout check
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(parseError(error))
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Intercept 401 Unauthorized status and run refresh token flow
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const hasSession = typeof window !== "undefined" && localStorage.getItem("streamify_has_session") === "true";

      // Do not attempt refresh if no session is active or we are already calling refresh-token
      if (!hasSession || originalRequest.url === "/users/refresh-token") {
        store.dispatch(clearAuth());
        if (typeof window !== "undefined") {
          localStorage.setItem("streamify_has_session", "false");
        }
        return Promise.reject(parseError(error));
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        await axios.post(`${BASE_URL}/users/refresh-token`, {}, { withCredentials: true });
        isRefreshing = false;
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        const parsed = parseError(refreshError);
        processQueue(parsed);
        store.dispatch(clearAuth());
        if (typeof window !== "undefined") {
          localStorage.setItem("streamify_has_session", "false");
        }
        return Promise.reject(parsed);
      }
    }

    return Promise.reject(parseError(error));
  }
);

export default apiClient;
