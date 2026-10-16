/**
 * Authentication Context & State Provider
 * Manages user credentials, JWT session persistence, and global authentication state.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import { StorageService } from '../services/storage';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'student' | 'admin' | string;
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User | null>;
  register: (fullName: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session on app launch
  useEffect(() => {
    async function restoreSession() {
      try {
        const storedToken = await StorageService.getToken();
        const storedUser = await StorageService.getUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch {
        // Silently clear corrupt storage
        await StorageService.clearAll();
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ApiService.login(email, password);
      await StorageService.setToken(data.access_token);
      await StorageService.setUser(JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user as User);
      return data.user as User;
    } catch (err: any) {
      setError(err.message || 'Login failed.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await ApiService.register(fullName, email, password);
      return true;
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await StorageService.clearAll();
    setToken(null);
    setUser(null);
    setError(null);
    setIsLoading(false);
  };

  const refreshUser = async () => {
    try {
      const updated = await ApiService.getMe();
      if (updated) {
        setUser(updated);
        await StorageService.setUser(JSON.stringify(updated));
      }
    } catch {
      // Ignored if offline
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
