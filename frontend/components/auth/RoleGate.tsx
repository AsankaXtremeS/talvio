"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getRoleHomeRoute, type AppRole } from "@/lib/roleRoutes";
import { authService } from "@/lib/auth.service";

type SessionUser = {
  id: string;
  role: AppRole;
  email: string;
};

interface RoleGateProps {
  allowedRoles: AppRole[];
  children: React.ReactNode;
}

export default function RoleGate({ allowedRoles, children }: RoleGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isHydrating, setUser, setAccessToken } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  const allowedRoleSet = useMemo(() => new Set(allowedRoles), [allowedRoles]);

  useEffect(() => {
    let isMounted = true;

    const handleAuthorizedUser = (sessionUser: SessionUser) => {
      if (!allowedRoleSet.has(sessionUser.role)) {
        router.replace(getRoleHomeRoute(sessionUser.role, sessionUser.id));
        return;
      }
      if (isMounted) {
        setIsChecking(false);
      }
    };

    const run = async () => {
      if (isHydrating) {
        return;
      }

      if (user) {
        handleAuthorizedUser(user as SessionUser);
        return;
      }

      try {
        const { user: sessionUser } = await authService.me();

        if (!sessionUser) {
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
          return;
        }

        setAccessToken("cookie-session");
        setUser(sessionUser);
        handleAuthorizedUser(sessionUser);
      } catch {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [allowedRoleSet, isHydrating, pathname, router, setAccessToken, setUser, user]);

  if (isChecking) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-600">
        Loading your dashboard...
      </div>
    );
  }

  return <>{children}</>;
}
