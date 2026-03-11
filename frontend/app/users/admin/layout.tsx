"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardCheck,
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

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/users/admin/dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "Candidates",
    href: "/users/admin/candidates",
    icon: <Users size={18} />,
  },
  {
    label: "Companies",
    href: "/users/admin/companies",
    icon: <Building2 size={18} />,
  },
  {
    label: "Pending Approvals",
    href: "/users/admin/pending-approvals",
    icon: <ClipboardCheck size={18} />,
  },
];

// -------------------------------------------------
// Props — admin info comes from auth context
// Replace with useAuth() hook when ready
// -------------------------------------------------
interface SidebarProps {
  adminName?: string;
  adminAvatar?: string; // URL to avatar image
}

// -------------------------------------------------
// Root layout — wraps all admin pages
// -------------------------------------------------
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-[#F4F6FB] md:p-4 gap-0 md:gap-4 overflow-hidden">
      {/* Mobile sidebar overlay */}
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} isMobile />
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="relative flex flex-col flex-1 min-w-0 overflow-y-auto">
        {/* Mobile topbar with menu button */}
        <div className="z-20 flex items-center px-4 bg-white shadow-sm md:hidden h-14">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 focus:outline-none"
            aria-label="Open sidebar"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
          </button>
          <span className="ml-4 text-lg font-bold text-gray-900">Talvio Admin</span>
        </div>
        {/* Main content area all pages render here*/}
        <div className="flex-1 min-h-0">
          {children}
        </div>
      </main>
    </div>
  );
}

// -------------------------------------------------
// Sidebar component
// -------------------------------------------------
function Sidebar({
  adminName = "Admin101",
  adminAvatar = "/images/avatar1.jpg",
  mobileOpen = false,
  setMobileOpen,
  isMobile = false,
}: SidebarProps & { mobileOpen?: boolean; setMobileOpen?: (open: boolean) => void; isMobile?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => pathname.startsWith(href);

  const handleSignOut = () => {
    // TODO: call auth.service.ts signOut() then redirect
    router.push("/login");
  };

  // Mobile sidebar overlay
  if (isMobile) {
    return (
      <div
        className={`fixed inset-0 z-40 md:hidden ${mobileOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity duration-200 ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOpen && setMobileOpen(false)}
        />
        {/* Sidebar */}
        <aside
          className={`absolute left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-100 z-50 transform transition-transform duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-4">
            <span className="text-[22px] font-extrabold text-gray-900 tracking-tight">Talvio</span>
            <button
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className="ml-auto text-gray-400 hover:text-gray-700"
              aria-label="Close sidebar"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div className="mx-0 mb-4 border-t border-gray-100" />
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gray-50">
            <Image
              src={adminAvatar}
              alt={adminName}
              width={36}
              height={36}
              className="object-cover rounded-lg shrink-0 w-9 h-9"
              priority
            />
            <p className="text-sm font-semibold text-gray-800 truncate">{adminName}</p>
            <Link href="/users/admin/settings" className="ml-auto text-gray-400 shrink-0 hover:text-gray-700" aria-label="Admin settings">
              <Settings size={16} />
            </Link>
          </div>
          <nav className="flex-1 px-0 mt-5">
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mb-2 px-4">Main Menu</p>
            <ul className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${active ? "bg-indigo-50 text-indigo-700" : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"}`}
                      onClick={() => setMobileOpen && setMobileOpen(false)}
                    >
                      <span className={`shrink-0 ${active ? "text-indigo-600" : "text-gray-400"}`}>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="px-4 mb-2">
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center w-full gap-3 px-3 py-3 text-sm font-semibold text-white transition-colors duration-150 bg-indigo-600 rounded-xl hover:bg-indigo-700"
            >
              <span className="flex items-center justify-center w-full gap-2">
                <LogOut size={16} className="shrink-0" />
                <span>Sign Out</span>
              </span>
            </button>
          </div>
        </aside>
      </div>
    );
  }

  // Desktop sidebar (unchanged)
  return (
    <aside
      className={`
        relative flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100
        transition-all duration-300 ease-in-out shrink-0 overflow-hidden
        ${collapsed ? "w-18" : "w-60"}
        h-full p-4
        hidden md:flex
      `}
    >
      {/* ...existing code... */}
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
      <div className="mx-0 mb-4 border-t border-gray-100" />
      <div
        className={`
          flex items-center gap-3 px-2 py-2 rounded-xl bg-gray-50
          ${collapsed ? "justify-center" : "justify-between"}
        `}
      >
        <div className="flex items-center min-w-0 gap-3">
          <Image
            src={adminAvatar}
            alt={adminName}
            width={36}
            height={36}
            className="rounded-lg bject-cover fshrink-0 w-9 h-9"
            priority
          />
          {!collapsed && (
            <p className="text-sm font-semibold text-gray-800 truncate">
              {adminName}
            </p>
          )}
        </div>
        {!collapsed && (
          <Link
            href="/users/admin/settings"
            className="text-gray-400 transition-colors shrink-0 hover:text-gray-700"
            aria-label="Admin settings"
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
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </span>
        </button>
      </div>
    </aside>
  );
}