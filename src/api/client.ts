import axios from "axios";

// Create the Axios instance
const apiClient = axios.create({
  baseURL: (import.meta as ImportMeta & { env: { VITE_API_BASE_URL?: string } }).env
    .VITE_API_BASE_URL, // comes from .env
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Global 401 handling: when the session expires, the registered handler clears
// auth state + cached data, and ProtectedRoute then redirects to /login.
// (Registered from AppProviders to avoid circular imports with the store.)
let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? "";
    // Ignore /auth/* calls: a 401 there is expected (bad credentials, or the
    // initial "am I logged in?" check on app start).
    if (status === 401 && !url.startsWith("/auth/")) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

export default apiClient;