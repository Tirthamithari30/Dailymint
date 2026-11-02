import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string, currency?: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  updateUser: (data: { name?: string; currency?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('dailymint_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('dailymint_token');
      if (storedToken) {
        try {
          const res = await api.getProfile();
          setUser(res.user);
          setToken(storedToken);
        } catch {
          // Token invalid, clear it
          localStorage.removeItem('dailymint_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await api.login({ email, password: pass });
      localStorage.setItem('dailymint_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, pass: string, currency = '₹') => {
    setIsLoading(true);
    try {
      const data = await api.signup({ name, email, password: pass, currency });
      localStorage.setItem('dailymint_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async () => {
    setIsLoading(true);
    try {
      const data = await api.demoLogin();
      localStorage.setItem('dailymint_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('dailymint_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = async (data: { name?: string; currency?: string }) => {
    const res = await api.updateProfile(data);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        signup,
        demoLogin,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
