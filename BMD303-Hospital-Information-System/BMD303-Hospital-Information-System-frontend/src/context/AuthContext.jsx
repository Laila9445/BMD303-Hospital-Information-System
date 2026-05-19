import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import authService from '../api/authService';
import { applyJwtRoleToUser, getJwtRole } from '../utils/authUtils';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      const synced = applyJwtRoleToUser(currentUser);
      if (synced.role !== currentUser.role) {
        localStorage.setItem('user', JSON.stringify(synced));
        localStorage.setItem('clinic_current_user', JSON.stringify(synced));
      }
      setUser(synced);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, user: response.user };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, user: response.user };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  const effectiveRole = user?.role ?? getJwtRole();

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      effectiveRole,
      isDoctor: effectiveRole === 'Doctor',
      isPatient: effectiveRole === 'Patient',
      isNurse: effectiveRole === 'Nurse',
      isPhysio: effectiveRole === 'Physiotherapist',
      isRadiology: effectiveRole === 'Radiologist',
    }),
    [user, loading, isAuthenticated, effectiveRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
