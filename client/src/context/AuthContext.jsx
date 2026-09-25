import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('orca_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('orca_token');
      const storedUser = localStorage.getItem('orca_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Verify with backend
          const res = await authService.getMe();
          if (res?.user) {
            setUser(res.user);
            localStorage.setItem('orca_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Auto auth validation failed, using cached session:', err.message);
        }
      } else {
        // Automatically provide a default fisherman session for instantaneous exploration if preferred
        const guestFisherman = {
          id: 'demo_fisherman',
          name: 'Captain Rajesh Patil',
          email: 'fisherman@orca.demo',
          role: 'Fisherman',
          preferredLocation: { name: 'Mumbai Offshore', latitude: 18.922, longitude: 72.8347 }
        };
        setUser(guestFisherman);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.token && res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('orca_token', res.token);
        localStorage.setItem('orca_user', JSON.stringify(res.user));
        return { success: true, user: res.user };
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authService.register(userData);
      if (res.token && res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('orca_token', res.token);
        localStorage.setItem('orca_user', JSON.stringify(res.user));
        return { success: true, user: res.user };
      }
      throw new Error(res.message || 'Registration failed');
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('orca_token');
    localStorage.removeItem('orca_user');
  };

  const quickLoginAs = async (roleName) => {
    const credentials = {
      Fisherman: { email: 'fisherman@orca.demo', password: 'ORCA@123' },
      Researcher: { email: 'researcher@orca.demo', password: 'ORCA@123' },
      Authority: { email: 'authority@orca.demo', password: 'ORCA@123' },
      Administrator: { email: 'admin@orca.demo', password: 'ORCA@123' }
    };

    const target = credentials[roleName] || credentials.Fisherman;
    return login(target.email, target.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        quickLoginAs
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
