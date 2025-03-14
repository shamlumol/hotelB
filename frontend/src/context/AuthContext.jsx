import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    console.log('[DEBUG] AuthContext - Current User State:', user);
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/auth/me`);
      console.log('[DEBUG] AuthContext - GET /auth/me Response:', res.data);
      if (res.data.success) {
        setUser(res.data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error('[DEBUG] AuthContext - Error fetching user profile:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      console.log('[DEBUG] AuthContext - Login Response:', res.data);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: 'Invalid server response' };
    } catch (err) {
      console.error('[DEBUG] AuthContext - Login Error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.'
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      console.log('[DEBUG] AuthContext - Register Response:', res.data);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: 'Registration failed' };
    } catch (err) {
      console.error('[DEBUG] AuthContext - Register Error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed'
      };
    }
  };

  const loginWithGoogle = async (idToken) => {
    try {
      const res = await axios.post(`${API_URL}/auth/google`, { idToken });
      console.log('[DEBUG] AuthContext - Google Login Response:', res.data);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: 'Google login database synchronization failed.' };
    } catch (err) {
      console.error('[DEBUG] AuthContext - Google login error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Google authentication failed.'
      };
    }
  };

  const loginWithApple = async (email, name) => {
    try {
      const res = await axios.post(`${API_URL}/auth/apple`, { email, name });
      console.log('[DEBUG] AuthContext - Apple Login Response:', res.data);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: 'Apple login database synchronization failed.' };
    } catch (err) {
      console.error('[DEBUG] AuthContext - Apple login error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Apple authentication failed.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    console.log('[DEBUG] AuthContext - User logged out, state and storage cleared');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        token,
        login,
        register,
        loginWithGoogle,
        loginWithApple,
        logout,
        fetchUserProfile,
        API_URL
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
