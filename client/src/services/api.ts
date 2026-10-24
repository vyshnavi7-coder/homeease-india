import axios from "axios";

const BACKEND_URL = (import.meta as any).env?.VITE_API_URL || "";
const API_BASE = BACKEND_URL ? `${BACKEND_URL.replace(/\/+$/, "")}/api` : "/api";

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercept requests to attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("homeease_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired
      // localStorage.removeItem("homeease_token");
    }
    return Promise.reject(error);
  }
);
