'use client';
import { createContext, useContext, useState } from 'react';
import { authService } from '@/lib/auth.service';

interface AuthUser {
  id: string;
  role: 'STUDENT' | 'PROFESSIONAL' | 'EMPLOYER' | 'ADMIN';
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  setUser: (user: AuthUser | null) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setAccessToken(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, setUser, setAccessToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
