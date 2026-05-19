import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services';

const PhysioAuthContext = createContext(null);

export const usePhysioAuth = () => {
  const context = useContext(PhysioAuthContext);
  if (!context) {
    throw new Error('usePhysioAuth must be used within a PhysioAuthProvider');
  }
  return context;
};

export const PhysioAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const token = authService.getToken();
    if (token) {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to load user:', error);
        authService.logout();
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const user = await authService.getCurrentUser();
    setCurrentUser(user);
    return data;
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    isAuthenticated: !!currentUser,
  };

  return (
    <PhysioAuthContext.Provider value={value}>{children}</PhysioAuthContext.Provider>
  );
};
