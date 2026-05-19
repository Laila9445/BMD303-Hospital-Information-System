import apiClient from './apiClient';
import { unwrapAuthResponse, getApiErrorMessage } from './apiUtils';
import { applyJwtRoleToUser } from '../utils/authUtils';

const CURRENT_USER_KEY = 'clinic_current_user';

const persistSession = (payload) => {
  const auth = unwrapAuthResponse(payload);
  if (!auth?.token) return null;

  localStorage.removeItem('physio_token');
  localStorage.setItem('token', auth.token);

  const user = applyJwtRoleToUser(auth.user, auth.token);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  sessionStorage.removeItem('auth_redirecting');

  return { ...auth, user };
};

const authService = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/api/Auth/login', { email, password });
      const auth = persistSession(response.data);
      if (auth) {
        return {
          success: true,
          token: auth.token,
          user: auth.user,
          message: auth.message || 'Login successful',
        };
      }
      return { success: false, message: 'Login failed' };
    } catch (error) {
      return {
        success: false,
        message: getApiErrorMessage(error, 'Invalid email or password'),
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await apiClient.post('/api/Auth/register', userData);
      const auth = persistSession(response.data);
      if (auth) {
        return {
          success: true,
          token: auth.token,
          user: auth.user,
          message: auth.message || 'Registration successful!',
        };
      }
      return { success: false, message: 'Registration failed' };
    } catch (error) {
      return {
        success: false,
        message: getApiErrorMessage(error, 'Registration error'),
      };
    }
  },

  getProfile: async () => {
    try {
      const response = await apiClient.get('/api/Auth/profile');
      return response.data;
    } catch {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('physio_token');
    sessionStorage.removeItem('auth_redirecting');
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return applyJwtRoleToUser(JSON.parse(raw));
    } catch {
      return null;
    }
  },

  isAuthenticated: () => !!localStorage.getItem('token'),
};

export default authService;
