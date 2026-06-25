import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import socketService from '../services/socket';

const AuthContext = createContext(null);

export function getDashboardPath(role) {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'senior':
      return '/senior/dashboard';
    case 'developer':
      return '/dashboard';
    case 'junior':
    default:
      return '/dashboard';
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('skillbridge_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('skillbridge_user');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      try {
        socketService.connect(token);
      } catch {
        // Socket connection failed, continue without real-time features
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem('skillbridge_token', newToken);
    localStorage.setItem('skillbridge_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    try {
      socketService.connect(newToken);
    } catch {
      // Socket connection failed, continue without real-time features
    }
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const response = await authAPI.register(data);
    const { token: newToken, user: userData, accountStatus, message } = response.data;

    // If pending approval, don't store token or login
    if (accountStatus === 'pending') {
      return { accountStatus: 'pending', message, user: userData };
    }

    localStorage.setItem('skillbridge_token', newToken);
    localStorage.setItem('skillbridge_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    try {
      socketService.connect(newToken);
    } catch {
      // Socket connection failed, continue without real-time features
    }
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem('skillbridge_token');
    localStorage.removeItem('skillbridge_user');
    socketService.disconnect();
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((newData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem('skillbridge_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
