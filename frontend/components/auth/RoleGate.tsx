"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getRoleHomeRoute, type AppRole } from "@/lib/roleRoutes";

interface RoleGateProps {
  allowedRoles: AppRole[];
  children: React.ReactNode;
}

export default function RoleGate({ allowedRoles, children }: RoleGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isHydrating } = useAuth();

  const allowedRoleSet = useMemo(() => new Set(allowedRoles), [allowedRoles]);

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!allowedRoleSet.has(user.role as AppRole)) {
      router.replace(getRoleHomeRoute(user.role as AppRole, user.id));
    }
  }, [allowedRoleSet, isHydrating, pathname, router, user]);

  if (isHydrating || !user || !allowedRoleSet.has(user.role as AppRole)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-600">
        Loading your dashboard...
      </div>
    );
  }

  return <>{children}</>;
}
