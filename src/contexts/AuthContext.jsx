import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
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
        isAuthenticated: !!currentUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
