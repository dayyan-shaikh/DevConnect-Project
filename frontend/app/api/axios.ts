import axios from "axios";
import type { AxiosInstance } from "axios";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: "http://localhost:3000", // NestJS backend
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach token automatically if available
axiosInstance.interceptors.request.use((config) => {
  console.log('Axios request interceptor:', config.method?.toUpperCase(), config.url);
  const token = localStorage.getItem("access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Axios response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Axios error:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
