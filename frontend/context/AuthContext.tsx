'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/lib/auth.service';

interface AuthUser {
  id: string;
  role: 'STUDENT' | 'PROFESSIONAL' | 'EMPLOYER' | 'ADMIN';
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  preferences?: {
    locale?: string;
    theme?: string;
  } | null;
  permissions?: string[];
  employerProfile?: {
    companyName: string;
    verificationStatus: string;
    rejectionReason?: string | null;
  } | null;
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isHydrating: boolean;
  setUser: (user: AuthUser | null) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let mounted = true;

    const hydrateSession = async () => {
      try {
        const { user: sessionUser } = await authService.me();
        if (!mounted || !sessionUser) return;

        setUser(sessionUser);
        setAccessToken('cookie-session');
      } catch {
        if (!mounted) return;
        setUser(null);
        setAccessToken(null);
      } finally {
        if (mounted) setIsHydrating(false);
      }
    };

    hydrateSession();

    return () => {
      mounted = false;
    };
  }, []);

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setAccessToken(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isHydrating, setUser, setAccessToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
