// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pc_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('pc_token', data.token);
    localStorage.setItem('pc_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const signup = async (name, email, password) => {
    const { data } = await api.post('/auth/signup', { name, email, password });
    localStorage.setItem('pc_token', data.token);
    localStorage.setItem('pc_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('pc_token');
    localStorage.removeItem('pc_user');
    setUser(null);
  }, []);

  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('pc_logout', handler);
    setLoading(false);
    return () => window.removeEventListener('pc_logout', handler);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
