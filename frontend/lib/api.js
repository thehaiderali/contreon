import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api", // fix env name
  withCredentials: true,
});
api.interceptors.request.use(
  (config) => {
    console.log(`📤 [REQUEST] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log(`📤 withCredentials: ${config.withCredentials}`);
    console.log(`📤 Cookies: ${document.cookie || 'No cookies'}`);
    return config;
  },
  (error) => Promise.reject(error)
);
 
// ✅ Add interceptor to log responses
api.interceptors.response.use(
  (response) => {
    console.log(`📥 [RESPONSE] ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.log(`❌ [ERROR] ${error.response?.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    console.log(`❌ withCredentials was: ${error.config?.withCredentials}`);
    return Promise.reject(error);
  }
);