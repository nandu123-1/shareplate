import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from '../services/api';
import { User, DonorProfile, RecipientProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: DonorProfile | RecipientProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  switchDemoAccount: (role: 'DONOR' | 'RECIPIENT' | 'ADMIN') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DonorProfile | RecipientProfile | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.getCurrentUser();
      setUser(data.user);
      setProfile(data.profile);
    } catch (err) {
      console.error('Failed to load user session:', err);
      setAuthToken(null);
      setUser(null);
      setProfile(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.login({ email, password });
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    setProfile(data.profile);
  };

  const register = async (payload: any) => {
    const data = await api.register(payload);
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    setProfile(data.profile);
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const switchDemoAccount = async (role: 'DONOR' | 'RECIPIENT' | 'ADMIN') => {
    if (role === 'DONOR') {
      await login('donor@greenleaf.com', 'password123');
    } else if (role === 'RECIPIENT') {
      await login('ngo@hopehaven.org', 'password123');
    } else if (role === 'ADMIN') {
      await login('admin@shareplate.org', 'admin123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        login,
        register,
        logout,
        switchDemoAccount,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
