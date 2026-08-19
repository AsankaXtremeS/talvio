'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { authService } from '@/lib/auth.service';

interface AuthUser {
  id: string;
  role: 'STUDENT' | 'PROFESSIONAL' | 'EMPLOYER' | 'ADMIN';
  email: string;
  name?: string | null;
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
    companyLogoUrl?: string | null;
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
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [hasHydratedSession, setHasHydratedSession] = useState(false);

  useEffect(() => {
    let mounted = true;

    const needsSessionHydration =
      pathname.startsWith('/users') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/oauth');

    // Public pages do not need an immediate /me call, which removes one blocking network hop.
    if (!needsSessionHydration) {
      setIsHydrating(false);
      return () => {
        mounted = false;
      };
    }

    // Reuse existing auth state across internal route changes.
    if (hasHydratedSession) {
      setIsHydrating(false);
      return () => {
        mounted = false;
      };
    }

    setIsHydrating(true);

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
        if (mounted) {
          setHasHydratedSession(true);
          setIsHydrating(false);
        }
      }
    };

    hydrateSession();

    return () => {
      mounted = false;
    };
  }, [hasHydratedSession, pathname]);

  const logout = async () => {
    await authService.logout();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("token");
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
