import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('coach_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/api/auth/me');
        setUser(response.data);
      } catch (err) {
        console.error('Session validation error:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (username) => {
    const response = await api.post('/api/auth/login', { username });
    const userData = response.data;
    localStorage.setItem('coach_token', userData.token);
    setToken(userData.token);
    setUser(userData);
    return userData;
  };

  const register = async (username) => {
    const response = await api.post('/api/auth/register', { username });
    const userData = response.data;
    localStorage.setItem('coach_token', userData.token);
    setToken(userData.token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('coach_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
