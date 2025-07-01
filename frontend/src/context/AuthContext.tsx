// AuthProvider Login and Logout

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../api/axios';

type User = {
  id: string;
  email?: string;
};

type AuthContextType = {
  isLoggedIn: boolean;
  authLoading: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const checkAuth = async (): Promise<boolean> => {
    try {
      const response = await api.get('/auth/verify');
      setIsLoggedIn(true);
      setUser(response.data.user);
      setAuthLoading(false);
      return true;
    } catch (error) {
      setIsLoggedIn(false);
      setUser(null);
      setAuthLoading(false);
      return false;
    }
  };

  const login = (userData: User) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, authLoading, user, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};