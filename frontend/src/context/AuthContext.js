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

  const isStaticHost =
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    !process.env.REACT_APP_API_URL;

  const login = useCallback(async (email, password) => {
    const normalizedEmail = (email || '').toLowerCase().trim();

    // On static deployments (e.g. Vercel static SPA without live API server)
    if (isStaticHost) {
      if (
        (normalizedEmail === 'admin@bakeurcurl.com' || normalizedEmail === 'admin@curlco.com') &&
        (password === 'Admin@123' || password === 'Admin@123Updated')
      ) {
        const adminUser = {
          _id: '6acba18ca9e3986c6f507684',
          name: 'Admin User',
          email: normalizedEmail,
          role: 'admin',
          isActive: true,
        };
        const mockToken = 'mock-admin-token-' + Date.now();
        localStorage.setItem('BakeUrCurl_token', mockToken);
        localStorage.setItem('BakeUrCurl_user', JSON.stringify(adminUser));
        setUser(adminUser);
        return adminUser;
      }

      if (
        (normalizedEmail === 'zara@bakeurcurl.com' || normalizedEmail === 'marcus@bakeurcurl.com') &&
        password === 'Staff@123'
      ) {
        const staffUser = {
          _id: 'staff-static-id',
          name: normalizedEmail.startsWith('zara') ? 'Zara Thompson' : 'Marcus Rivera',
          email: normalizedEmail,
          role: 'staff',
          isActive: true,
        };
        const mockToken = 'mock-staff-token-' + Date.now();
        localStorage.setItem('BakeUrCurl_token', mockToken);
        localStorage.setItem('BakeUrCurl_user', JSON.stringify(staffUser));
        setUser(staffUser);
        return staffUser;
      }

      throw new Error('Invalid email or password.');
    }

    // Live backend API (localhost or remote server)
    const response = await api.post('/auth/login', { email, password });
    if (response.data && response.data.user && response.data.token) {
      const { token, user: userData } = response.data;
      localStorage.setItem('BakeUrCurl_token', token);
      localStorage.setItem('BakeUrCurl_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }
    throw new Error('Unexpected server response');
  }, [isStaticHost]);

  const register = useCallback(async (formData) => {
    if (isStaticHost) {
      const newUser = {
        _id: 'cust-' + Date.now(),
        name: formData.name || 'Valued Customer',
        email: formData.email,
        phone: formData.phone || '',
        role: 'customer',
        isActive: true,
      };
      const mockToken = 'mock-cust-token-' + Date.now();
      localStorage.setItem('BakeUrCurl_token', mockToken);
      localStorage.setItem('BakeUrCurl_user', JSON.stringify(newUser));
      setUser(newUser);
      return newUser;
    }

    const response = await api.post('/auth/register', formData);
    if (response.data && response.data.user && response.data.token) {
      const { token, user: userData } = response.data;
      localStorage.setItem('BakeUrCurl_token', token);
      localStorage.setItem('BakeUrCurl_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }
    throw new Error('Unexpected registration response');
  }, [isStaticHost]);

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

