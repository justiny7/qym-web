'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { getCurrentUser, login as apiLogin, logout as apiLogout } from '@/utils/auth';

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const loggedInUser = await apiLogin(email, password);
      setUser(loggedInUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    setUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
