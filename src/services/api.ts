
import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

const api = axios.create({
  baseURL: configuredBaseUrl
    ? configuredBaseUrl.replace(/\/+$/, "")
    : "http://localhost:5284",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT to every API request when a token exists.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: unknown) => Promise.reject(error),
);

export default api;
