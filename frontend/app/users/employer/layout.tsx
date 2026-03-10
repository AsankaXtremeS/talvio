"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  SquareUser,
  LogOut,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

// -------------------------------------------------
// Types
// -------------------------------------------------
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

// -------------------------------------------------
// Nav items — matches your Figma sidebar exactly
// Dashboard · Candidates · Job Posts · Interviews
// -------------------------------------------------
const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/users/employer/dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "Candidates",
    href: "/users/employer/candidates",
    icon: <Users size={18} />,
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
// Props — company info comes from auth context
// Replace with useAuth() hook when ready
// -------------------------------------------------
interface SidebarProps {
  companyName?: string;
  companyRole?: string;       // e.g. "Team · 100 Members"
  companyInitial?: string;    // e.g. "R" for Rackspace
}

// -------------------------------------------------
// Root layout — wraps all employer pages
// -------------------------------------------------
export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F6FB] p-4 gap-4">
      <Sidebar />
      <main className="flex flex-col flex-1 min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}

// -------------------------------------------------
// Sidebar component (used only inside this layout)
// -------------------------------------------------
function Sidebar({
  companyName = "Rackspace",
  companyRole = "Team · 100 Members",
  companyInitial = "R",
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  // Active link detection
  const isActive = (href: string) => pathname.startsWith(href);

  const handleSignOut = () => {
    // TODO: call auth.service.ts signOut() then redirect
    router.push("/login");
  };

  return (
    <aside
      className={`
        relative flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100
        transition-all duration-300 ease-in-out flex-shrink-0 overflow-hidden
        ${collapsed ? "w-[72px]" : "w-[240px]"}
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
        {/* Avatar */}
        <div className="flex items-center min-w-0 gap-3">
          <div className="flex items-center justify-center flex-shrink-0 text-sm font-bold text-white bg-gray-800 rounded-lg w-9 h-9">
            {companyInitial}
          </div>

          {/* Name + role — hidden when collapsed */}
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {companyName}
              </p>
              <p className="text-[11px] text-gray-400 truncate">{companyRole}</p>
            </div>
          )}
        </div>

        {/* Settings icon — hidden when collapsed */}
        {!collapsed && (
          <Link
            href="/users/employer/profile/edit"
            className="flex-shrink-0 text-gray-400 transition-colors hover:text-gray-700"
            aria-label="Company settings"
          >
            <Settings size={16} />
          </Link>
        )}
      </div>

      {/* ── NAV MENU ── */}
      <nav className="flex-1 px-0 mt-5">
        {/* Label */}
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
                  {/* Icon */}
                  <span
                    className={`flex-shrink-0 ${
                      active ? "text-indigo-600" : "text-gray-400"
                    }`}
                  >
                    {item.icon}
                  </span>

                  {/* Label — hidden when collapsed */}
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
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-xl
            bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold
            transition-colors duration-150
            ${collapsed ? "justify-center" : "justify-center"}
          `}
        >
          <span className="flex items-center justify-center w-full gap-2">
            <LogOut size={16} className="flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </span>
        </button>
      </div>
    </aside>
  );
}