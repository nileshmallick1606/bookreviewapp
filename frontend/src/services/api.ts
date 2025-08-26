// src/services/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This is important for cookies / authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add authentication headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx
    return response;
  },
  (error) => {
    // Any status codes outside the range of 2xx
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

export default api;
