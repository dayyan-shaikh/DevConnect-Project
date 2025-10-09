import axios from "axios";
import type { AxiosInstance } from "axios";

// Determine the base URL based on the environment
const getBaseUrl = () => {
  // In production, use VITE_API_URL_PRODUCTION if it exists, otherwise fall back to VITE_API_URL
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL_PRODUCTION || import.meta.env.VITE_API_URL || "http://localhost:3000";
  }
  // In development, use VITE_API_URL or fall back to localhost
  return import.meta.env.VITE_API_URL || "http://localhost:3000";
};

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
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
