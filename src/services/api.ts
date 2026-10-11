import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5284",
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