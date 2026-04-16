// src/utils/api.js
import axios from 'axios';
import DOMPurify from 'dompurify';

export const API_BASE = import.meta.env.VITE_API_URL || 'https://proof-craft-backend.vercel.app/api';

const api = axios.create({ baseURL: API_BASE });

// Attach JWT automatically
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('pc_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// On 401, clear auth state
api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pc_token');
      localStorage.removeItem('pc_user');
      window.dispatchEvent(new Event('pc_logout'));
    }
    return Promise.reject(err);
  }
);

export default api;

// Safe HTML sanitizer (for rich-text CV content)
export const sanitize = (html) => DOMPurify.sanitize(html, {
  ALLOWED_TAGS: ['b','i','strong','em','ul','ol','li','a','br','p','span'],
  ALLOWED_ATTR: ['href','target','rel','style']
});

// src/context/AuthContext.jsx
export const AuthContext_CODE = `
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
`;
