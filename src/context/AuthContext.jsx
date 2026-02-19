import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load user on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        API.defaults.headers.common['x-auth-token'] = token;

        try {
          // 🔥 ALWAYS fetch full profile
          const res = await API.get('/profile/me');
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (error) {
          console.error("Auth init failed:", error);
          logout();
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  // ✅ Proper updateUser
  const updateUser = async () => {
    try {
      const res = await API.get('/profile/me');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (error) {
      console.error("Update user failed:", error);
    }
  };

  // ✅ Login
  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });

      const { token } = res.data;

      localStorage.setItem('token', token);
      API.defaults.headers.common['x-auth-token'] = token;

      // 🔥 Fetch full profile after login
      const profileRes = await API.get('/profile/me');
      setUser(profileRes.data);
      localStorage.setItem('user', JSON.stringify(profileRes.data));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  // ✅ Register
  const register = async (userData) => {
    try {
      const res = await API.post('/auth/register', userData);

      const { token } = res.data;

      localStorage.setItem('token', token);
      API.defaults.headers.common['x-auth-token'] = token;

      const profileRes = await API.get('/profile/me');
      setUser(profileRes.data);
      localStorage.setItem('user', JSON.stringify(profileRes.data));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete API.defaults.headers.common['x-auth-token'];
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser   // ✅ VERY IMPORTANT
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
