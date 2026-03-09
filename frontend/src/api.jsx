import axios from 'axios';
import { getToken, clearAuth } from "./Auth";

// Create an Axios instance with a base URL = where your backend server is running
const api = axios.create({
  baseURL: '/api', 
  validateStatus: () => true,
  headers: {
    "Content-Type": "application/json"
  }
});


// Attach Authorization header automatically
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// Intercept all responses
api.interceptors.response.use(
  (response) => {

    // Handle expired/invalid token
    if (response.status === 401) {
      clearAuth();
      window.dispatchEvent(new Event("auth:changed"));
    }

    if (response.status >= 400) {
      // Convert HTTP errors into rejected promises with clean data
      return Promise.reject({
        response
      });
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;