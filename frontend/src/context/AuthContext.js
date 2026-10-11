import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('BakeUrCurl_user');
    const storedToken = localStorage.getItem('BakeUrCurl_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('BakeUrCurl_user');
        localStorage.removeItem('BakeUrCurl_token');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user: userData } = response.data;
    localStorage.setItem('BakeUrCurl_token', token);
    localStorage.setItem('BakeUrCurl_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (formData) => {
    const response = await api.post('/auth/register', formData);
    const { token, user: userData } = response.data;
    localStorage.setItem('BakeUrCurl_token', token);
    localStorage.setItem('BakeUrCurl_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('BakeUrCurl_token');
    localStorage.removeItem('BakeUrCurl_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedData) => {
    const newUser = { ...user, ...updatedData };
    localStorage.setItem('BakeUrCurl_user', JSON.stringify(newUser));
    setUser(newUser);
  }, [user]);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff' || user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        updateUser,
        isAuthenticated,
        isAdmin,
        isStaff,
        isCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;

