import axios from 'axios';

// Create axios instance with base URL and default headers
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000', // Change this to match your backend server URL
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to attach auth token to every request
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for global error handling
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;