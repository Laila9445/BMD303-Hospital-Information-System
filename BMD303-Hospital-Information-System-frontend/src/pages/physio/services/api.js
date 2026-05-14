import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_PHYSIO_API_URL || 'http://127.0.0.1:8000';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('physio_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('physio_token');
            window.location.href = '/physio/login';
        }
        return Promise.reject(error);
    }
);

export default api;
