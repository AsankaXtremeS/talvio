'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardCheck,
  Loader2,
  LogOut,
  PanelLeftOpen,
  PanelLeftClose,
  Settings,
  MessageSquare,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/auth.service';
import { setRedirectToast } from '@/lib/postRedirectToast';

const navItems = [
  { href: '/users/admin/dashboard',          label: 'Dashboard',         icon: LayoutDashboard },
  { href: '/users/admin/candidates',         label: 'Candidates',        icon: Users },
  { href: '/users/admin/companies',          label: 'Companies',         icon: Building2 },
  { href: '/users/admin/jobPosts',           label: 'Job Posts',         icon: MessageSquare },
  { href: '/users/admin/pending-approvals',  label: 'Pending Approvals', icon: ClipboardCheck },
];

interface AdminSidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  isMobile?: boolean;
}

export default function AdminSidebar({
  mobileOpen = false,
  setMobileOpen,
  isMobile = false,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser, setAccessToken } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const displayName = user?.firstName?.trim() || user?.email?.split('@')[0] || 'Admin';
  const initial = displayName.slice(0, 1).toUpperCase();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      setAccessToken(null);
      setRedirectToast({ message: 'Signed out successfully', tone: 'success' });
      router.replace('/login/admin');
    }
  };

  if (isMobile) {
    return (
      <div
        className={`fixed inset-0 z-40 md:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!mobileOpen}
      >
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity duration-200 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileOpen && setMobileOpen(false)}
        />

        <aside
          className={`absolute left-0 top-0 z-50 h-full w-64 transform border-r border-gray-100 bg-white shadow-lg transition-transform duration-200 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-5 pt-6 pb-4">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">Talvio</span>
            <button
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className="text-gray-400 transition-colors hover:text-gray-600"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-4 pb-4">
            <div className="h-px bg-gray-100" />
          </div>

          <div className="flex items-center gap-3 px-4 pb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-orange-300 to-pink-400 text-white text-sm font-semibold">
              {initial}
            </div>
            <span className="truncate text-sm font-semibold text-gray-800">{displayName}</span>
            <Link
              href="/users/admin/settings"
              className="ml-auto text-gray-400 transition-colors hover:text-gray-600"
              aria-label="Admin settings"
              onClick={() => setMobileOpen && setMobileOpen(false)}
            >
              <Settings size={16} />
            </Link>
          </div>

          <nav className="flex-1 px-3">
            <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Main Menu</p>
            <ul className="space-y-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                        active
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                      }`}
                      onClick={() => setMobileOpen && setMobileOpen(false)}
                    >
                      <Icon size={18} className={active ? 'text-indigo-500' : 'text-gray-400'} />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-indigo-700"
            >
              {isSigningOut ? 'Signing out...' : 'Sign Out'}
              {isSigningOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
            </button>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <aside
      className={`hidden h-full shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 md:flex md:flex-col ${
        collapsed ? 'w-18' : 'w-60'
      }`}
    >
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        {!collapsed && <span className="text-2xl font-bold text-gray-900 tracking-tight">Talvio</span>}
        <button
          onClick={() => setCollapsed((current) => !current)}
          className="ml-auto text-gray-400 transition-colors hover:text-gray-600"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <div className="px-4 pb-4">
        <div className="h-px bg-gray-100" />
      </div>

      <div className={`flex items-center gap-3 px-4 pb-5 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-full bg-linear-to-br from-orange-300 to-pink-400 flex items-center justify-center overflow-hidden shrink-0">
          <span className="text-white text-sm font-semibold">{initial}</span>
        </div>
        {!collapsed && <span className="text-sm font-semibold text-gray-800">{displayName}</span>}
        {!collapsed && (
          <Link href="/users/admin/settings" className="ml-auto text-gray-400 hover:text-gray-600 transition-colors">
            <Settings size={16} />
          </Link>
        )}
      </div>

      <nav className="flex-1 px-3">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">
            Main Menu
          </p>
        )}
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? label : undefined}
                >
                  <Icon
                    size={18}
                    className={active ? 'text-indigo-500' : 'text-gray-400'}
                  />
                  {!collapsed && label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4">
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-3 px-4 rounded-xl transition-colors duration-150"
        >
          {!collapsed && (isSigningOut ? 'Signing out...' : 'Sign Out')}
          {isSigningOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
        </button>
      </div>
    </aside>
  );
}
