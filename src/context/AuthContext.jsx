import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    return !(savedUser && savedToken);
  });

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Fetch full user profile on app load if token exists
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await axiosClient.get('/auth/getProfile');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('user', JSON.stringify(res.data.data));
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
          // Only logout if server explicitly responded with 401 Unauthorized (token invalid/expired)
          // Do not logout on network connection errors or server restart/503 states
          if (error.response && error.response.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (credentials) => {
    const res = await axiosClient.post('/auth/login', credentials);
    if (res.data.success && res.data.data) {
      const userData = res.data.data;
      setUser(userData);
      setToken(userData.token);
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await axiosClient.post('/auth/register', userData);
    if (res.data.success && res.data.data) {
      const newUser = res.data.data;
      setUser(newUser);
      setToken(newUser.token);
      localStorage.setItem('token', newUser.token);
      localStorage.setItem('user', JSON.stringify(newUser));
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const sendOTP = async (email) => {
    const res = await axiosClient.post('/auth/sendOTP', { email });
    return res.data;
  };

  const verifyOTP = async (email, otp) => {
    const res = await axiosClient.post('/auth/verifyOTP', { email, otp });
    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await axiosClient.post('/auth/forgotPassword', { email });
    return res.data;
  };

  const resetPassword = async (data) => {
    const res = await axiosClient.post('/auth/resetPassword', data);
    return res.data;
  };

  const updateProfile = async (formData) => {
    const res = await axiosClient.put('/auth/updateProfile', formData, {
      headers: {
        'Content-Type': formData instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    });
    if (res.data.success && res.data.data) {
      const updatedUser = res.data.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (updatedUser.token) {
        setToken(updatedUser.token);
        localStorage.setItem('token', updatedUser.token);
      }
      return res.data;
    }
    throw new Error(res.data.message || 'Profile update failed');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        sendOTP,
        verifyOTP,
        forgotPassword,
        resetPassword,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
