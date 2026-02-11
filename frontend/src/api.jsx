import axios from 'axios';

// Create an Axios instance with a base URL = where your backend server is running
const api = axios.create({
  baseURL: '/api', 
  validateStatus: () => true,
  headers: {
    "Content-Type": "application/json"
  }
});

// Intercept all responses
api.interceptors.response.use(
  (response) => {
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