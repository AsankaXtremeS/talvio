"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  Cog,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from "lucide-react";
import RoleGate from "@/components/auth/RoleGate";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/lib/auth.service";
import { setRedirectToast } from "@/lib/postRedirectToast";

interface CandidateShellProps {
  children: React.ReactNode;
}

export default function CandidateShell({ children }: CandidateShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser, setAccessToken } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const roleLabel = user?.role === "PROFESSIONAL" ? "Professional" : "Undergraduate";
  const isProfessional = user?.role === "PROFESSIONAL";
  const isApplyJobPage = false;

  const navItems = [
    {
      label: "Dashboard",
      href: "/users/candidate/dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      label: "Applications",
      href: "/users/candidate/applications",
      icon: <FileText size={18} />,
    },
    {
      label: isProfessional ? "All Job Posts" : "All Internships",
      href: "/users/candidate/recommendations",
      icon: <Cog size={18} />,
    },
    {
      label: "Interview",
      href: "/users/candidate/interviews",
      icon: <CalendarDays size={18} />,
    },
  ];

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  const displayName = fullName || user?.email?.split("@")[0] || roleLabel;
  const avatarInitial = displayName.charAt(0).toUpperCase() || "U";

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
      router.replace("/login");
    }
  };

  // --- AUTH & ROLE CHECK DISABLED FOR DESIGN REVIEW ---
  // return (
  //   <RoleGate allowedRoles={["STUDENT", "PROFESSIONAL"]}>
  //     <div className="flex h-screen overflow-hidden bg-[#F4F6FB] p-4 gap-4">
  return (
      <div className="flex h-screen overflow-hidden bg-[#F4F6FB] p-4 gap-4">
        <aside
          className={`
            relative flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100
            transition-all duration-300 ease-in-out shrink-0 overflow-hidden
            ${collapsed ? "w-18" : "w-60"}
            ${isApplyJobPage ? "pointer-events-none select-none" : ""}
            h-full p-4
          `}
        >
          <div className="flex items-center justify-between px-1 pt-1 pb-4">
            {!collapsed && (
              <span className="text-[22px] font-extrabold text-gray-900 tracking-tight">Talvio</span>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="ml-auto text-gray-400 transition-colors hover:text-gray-700"
              aria-label="Toggle sidebar"
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          </div>

          <div className="mx-0 mb-4 border-t border-gray-100" />

          <div
            className={`
              flex items-center gap-3 px-2 py-2 rounded-xl bg-gray-50
              ${collapsed ? "justify-center" : "justify-between"}
            `}
          >
            <div className="flex items-center min-w-0 gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 shrink-0 flex items-center justify-center">
                <span className="text-sm font-semibold text-indigo-700">{avatarInitial}</span>
              </div>

              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                  <p className="text-[11px] text-gray-400 truncate">{roleLabel}</p>
                </div>
              )}
            </div>

            {!collapsed && (
              <Link
                href="/users/candidate/settings"
                className="shrink-0 text-gray-400 transition-colors hover:text-gray-700"
                aria-label="Profile settings"
              >
                <Settings size={16} />
              </Link>
            )}
          </div>

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
                      <span className={`${active ? "text-indigo-600" : "text-gray-400"}`}>
                        {item.icon}
                      </span>
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mb-2">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full cursor-pointer disabled:cursor-not-allowed flex items-center gap-3 px-3 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors duration-150 justify-center"
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

        <main className="flex flex-col flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    // </RoleGate>
  );
}
