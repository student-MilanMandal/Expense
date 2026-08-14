import axios from 'axios';

const defaultRenderUrl = 'https://expense-tracker-u23y.onrender.com/api';
const rawBaseUrl = (import.meta.env.VITE_API_URL || '').trim();

// Automatically connect to Render backend in production if VITE_API_URL is not explicitly set
const API_BASE_URL = rawBaseUrl
  ? (rawBaseUrl.replace(/\/+$/, '').endsWith('/api') ? rawBaseUrl.replace(/\/+$/, '') : `${rawBaseUrl.replace(/\/+$/, '')}/api`)
  : (import.meta.env.DEV ? '/api' : defaultRenderUrl);

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization Bearer Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor for global response error handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid - auto logout if token was set
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
