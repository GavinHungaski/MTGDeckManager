import { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user when token changes
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.getCurrentUser();
        setUser(response.data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Login function
  const login = useCallback(async (credentials) => {
    const response = await authAPI.login(credentials);
    const { token: newToken, user: userData } = response.data;
    
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    
    return userData;
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    const response = await authAPI.register(userData);
    const { token: newToken, user: newUser } = response.data;
    
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    
    return newUser;
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Try to call logout endpoint (don't wait for it)
      authAPI.logout().catch(() => {});
    } catch (err) {
      // Ignore errors
    }
    
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  }, []);

  const value = {
    token,
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;