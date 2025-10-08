import axios from "axios";


export const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080/api"
    : "https://gamereview.calmwave-ef10540f.uksouth.azurecontainerapps.io/api";

export const api = axios.create({
  baseURL: BASE_URL,
});

// 🧩 Automatically attach token if available
api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
