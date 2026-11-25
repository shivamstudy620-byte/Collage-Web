import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

const isTokenExpired = (jwtToken) => {
  try {
    const parts = jwtToken.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('rksd_admin_token');
    if (stored && isTokenExpired(stored)) {
      localStorage.removeItem('rksd_admin_token');
      return null;
    }
    return stored;
  });
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('rksd_admin_token');
    setToken(null);
    setAdmin(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('rksd:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('rksd:unauthorized', handleUnauthorized);
  }, [logout]);

  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setAdmin(null);
      setLoading(false);
      return undefined;
    }

    if (isTokenExpired(token)) {
      logout();
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    api.get('/auth/me')
      .then((res) => {
        if (!cancelled) {
          setAdmin(res.data.admin);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          logout();
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  const login = (authToken, adminData) => {
    localStorage.setItem('rksd_admin_token', authToken);
    setToken(authToken);
    setAdmin(adminData);
  };

  const updateToken = (newToken) => {
    if (newToken) {
      localStorage.setItem('rksd_admin_token', newToken);
      setToken(newToken);
    }
  };

  return (
    <AuthContext.Provider value={{ token, admin, isAuthenticated: !!token, loading, login, logout, updateToken }}>
      {children}
    </AuthContext.Provider>
  );
};
