import axios, { AxiosError } from "axios";
import type { AxiosInstance } from "axios";

const API: AxiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE}/api`,
  withCredentials: true,
  timeout: 15000, // ⏱️ fail fast if backend is slow
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

    // Auto logout on 401
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Only redirect if not already on login/register
      if (!["/login", "/register"].includes(currentPath)) {
        window.location.href = "/login";
      }
    }

    // Redirect to server error page
    if (status === 500) {
      window.location.href = "/server-error";
    }

    // Handle network issues
    // if (error.code === "ECONNABORTED" || error.message === "Network Error") {
    //   console.error("Network issue or request timed out");
    //   alert("Network issue — please check your connection.");
    // }

    return Promise.reject(error);
  }
);

export default API;
