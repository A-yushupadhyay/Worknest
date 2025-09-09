// /src/lib/api.ts
import axios, { AxiosError } from "axios";
import type { AxiosInstance } from "axios";

// Ensure base always has /api at the end
const rawBase = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const baseURL = rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;

const API: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});

// ===== Request Interceptor =====
API.interceptors.request.use(
  (cfg) => {
    const token = localStorage.getItem("token");
    if (token && cfg.headers) {
      cfg.headers.Authorization = `Bearer ${token}`;
    }
    return cfg;
  },
  (err) => Promise.reject(err)
);

// ===== Response Interceptor =====
API.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (!["/login", "/register"].includes(currentPath)) {
        window.location.href = "/login";
      }
    }

    if (status === 500) {
      window.location.href = "/server-error";
    }

    return Promise.reject(error);
  }
);

export default API;
