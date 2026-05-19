import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const PUBLIC_AUTH_PATHS = ['/api/Auth/login', '/api/Auth/register'];
const PUBLIC_ROUTES = ['/', '/login', '/register', '/services', '/about', '/contact', '/patients'];

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    if (status === 401) {
      const isPublicAuth = PUBLIC_AUTH_PATHS.some((p) => requestUrl.includes(p));
      const path = window.location.pathname;
      const isPublicRoute = PUBLIC_ROUTES.some(
        (r) => path === r || (r !== '/' && path.startsWith(r))
      );

      if (!isPublicAuth) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('clinic_current_user');

        if (!isPublicRoute && !sessionStorage.getItem('auth_redirecting')) {
          sessionStorage.setItem('auth_redirecting', '1');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { API_BASE_URL };
