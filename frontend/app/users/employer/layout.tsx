"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  SquareUser,
  Loader2,
  LogOut,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import RoleGate from "@/components/auth/RoleGate";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/lib/auth.service";
import { setRedirectToast } from "@/lib/postRedirectToast";

// -------------------------------------------------
// Types
// -------------------------------------------------
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

// -------------------------------------------------
// Nav items
// -------------------------------------------------
const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/users/employer/dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "Job Posts",
    href: "/users/employer/job-posts",
    icon: <Briefcase size={18} />,
  },
  {
    label: "Interviews",
    href: "/users/employer/interviews",
    icon: <SquareUser size={18} />,
  },
];

// -------------------------------------------------
// Props
// -------------------------------------------------
interface SidebarProps {
  companyName?: string;
  companyRole?: string;
  companyInitial?: string;
}

// -------------------------------------------------
// Root layout
// -------------------------------------------------
export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGate allowedRoles={["EMPLOYER"]}>
      <div className="flex h-screen overflow-hidden bg-[#F4F6FB] p-4 gap-4">
        <Sidebar />
        <main className="flex flex-col flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </RoleGate>
  );
}

// -------------------------------------------------
// Sidebar component
// -------------------------------------------------
function Sidebar({
  companyName = "Employer",
  companyRole = "Employer",
  companyInitial = "E",
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser, setAccessToken } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const resolvedCompanyName = user?.employerProfile?.companyName || companyName;
  const resolvedRoleLabel = user?.email ? `Employer · ${user.email}` : companyRole;
  const resolvedInitial = (user?.employerProfile?.companyName
    ? user.employerProfile.companyName.slice(0, 1).toUpperCase()
    : companyInitial
  );

  // Active link detection
  const isActive = (href: string) => pathname.startsWith(href);

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
      setAccessToken(null);
      setRedirectToast({ message: "Signed out successfully", tone: "success" });
      router.replace("/login/employer");
    }
  };

  return (
    <aside
      className={`
        relative flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100
        transition-all duration-300 ease-in-out shrink-0 overflow-hidden
        ${collapsed ? "w-18" : "w-60"}
        h-full p-4
      `}
    >
      {/* ── TOP: Logo + Collapse toggle ── */}
      <div className="flex items-center justify-between px-1 pt-1 pb-4">
        {!collapsed && (
          <span className="text-[22px] font-extrabold text-gray-900 tracking-tight">
            Talvio
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-gray-400 transition-colors hover:text-gray-700"
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      {/* Divider */}
      <div className="mx-0 mb-4 border-t border-gray-100" />

      {/* ── COMPANY INFO BLOCK ── */}
      <div
        className={`
          flex items-center gap-3 px-2 py-2 rounded-xl bg-gray-50
          ${collapsed ? "justify-center" : "justify-between"}
        `}
      >
        {/* Avatar & Info Linked to Profile View */}
        <Link 
          href="/users/employer/profile" 
          className="flex items-center min-w-0 gap-3 transition-opacity hover:opacity-75"
          title={collapsed ? "View Company Profile" : undefined}
        >
          <div className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-800 text-sm font-bold text-white">
            {user?.employerProfile?.companyLogoUrl ? (
              <Image
                src={user.employerProfile.companyLogoUrl}
                alt={`${resolvedCompanyName} logo`}
                fill
                sizes="36px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#101828] text-sm font-bold text-white">
                {resolvedInitial}
              </div>
            )}
          </div>

          {/* Name + role — hidden when collapsed */}
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {resolvedCompanyName}
              </p>
              <p className="text-[11px] text-gray-400 truncate">{resolvedRoleLabel}</p>
            </div>
          )}
        </Link>

        {/* Settings icon — hidden when collapsed */}
        {!collapsed && (
          <Link
            href="/users/employer/profile/edit"
            className="shrink-0 text-gray-400 transition-colors hover:text-gray-700"
            aria-label="Company settings"
          >
            <Settings size={16} />
          </Link>
        )}
      </div>

      {/* ── NAV MENU ── */}
      <nav className="flex-1 px-0 mt-5">
        {!collapsed && (
          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mb-2 px-2">
            Main Menu
          </p>
        )}

        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-150
                    ${
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                    }
                    ${collapsed ? "justify-center" : ""}
                  `}
                  title={collapsed ? item.label : undefined}
                >
                  <span
                    className={`shrink-0 ${
                      active ? "text-indigo-600" : "text-gray-400"
                    }`}
                  >
                    {item.icon}
                  </span>

                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── BOTTOM: Sign Out ── */}
      <div className="mb-2">
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-xl
            bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold
            transition-colors duration-150
            ${collapsed ? "justify-center" : "justify-center"}
          `}
        >
          <span className="flex items-center justify-center w-full gap-2">
            {isSigningOut ? (
              <Loader2 size={16} className="shrink-0 animate-spin" />
            ) : (
              <LogOut size={16} className="shrink-0" />
            )}
            {!collapsed && <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>}
          </span>
        </button>
      </div>
    </aside>
  );
}