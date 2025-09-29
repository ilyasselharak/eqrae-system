'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface User {
  id: string;
  username: string;
  email?: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('user-token');
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('user-token');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('user-token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check auth on mount
    checkAuth();
  }, [checkAuth]);

  const login = useCallback((userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('user-token', token);
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user-token');
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, loading, login, logout, updateUser, checkAuth }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}