import axios from "axios";

// ⭐ Use relative /api instead of localhost
const api = axios.create({
  baseURL: "/api",
});

// 🔥 Attach JWT automatically (original code kept)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
