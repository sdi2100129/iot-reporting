import axios from 'axios';

// Create an Axios instance with a base URL = where your backend server is running
const api = axios.create({
  baseURL: 'http://localhost:8000', 
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;