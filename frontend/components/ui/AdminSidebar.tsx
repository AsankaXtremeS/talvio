'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardCheck,
  LogOut,
  Settings,
  LayoutGrid,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard',         href: '/users/admin',            icon: LayoutDashboard },
  { label: 'Candidates',        href: '/users/admin/candidates', icon: Users },
  { label: 'Companies',         href: '/users/admin/companies',  icon: Building2 },
  { label: 'Pending Approvals', href: '/users/admin/pending',    icon: ClipboardCheck },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex flex-col w-56 h-screen bg-white border-r border-gray-100 shrink-0"
      style={{ boxShadow: '4px 0 24px rgba(99,91,255,0.07)' }}>

      {/* ── Logo ── */}
      <div className="flex items-center justify-between px-5 pt-6 pb-5">
        <span className="text-[22px] font-extrabold tracking-tight text-slate-900">
          Talvio
        </span>
        <button
          aria-label="Toggle layout"
          className="p-1.5 rounded-lg text-gray-300 hover:text-violet-600 transition-colors"
        >
          <LayoutGrid size={18} strokeWidth={1.8} />
        </button>
      </div>

      {/* Divider */}
      <div className="h-px mb-3 bg-gray-100" />

      {/* ── User Card ── */}
      <div className="flex items-center gap-2.5 mx-3 px-3 py-2.5 rounded-2xl bg-slate-50">
        {/* Avatar */}
        <div
          className="relative flex items-center justify-center w-[38px] h-[38px] rounded-full shrink-0"
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
            boxShadow: '0 2px 8px rgba(249,115,22,0.25)',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" fill="white" opacity="0.95" />
            <ellipse cx="12" cy="19" rx="7" ry="4" fill="white" opacity="0.85" />
          </svg>
          <span
            className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-green-400"
            style={{ border: '2px solid #f8fafc' }}
          />
        </div>

        <span className="flex-1 text-[13.5px] font-semibold text-slate-800 truncate">
          Admin101
        </span>

        <button
          aria-label="Settings"
          className="text-gray-300 transition-colors shrink-0 hover:text-violet-600"
        >
          <Settings size={15} strokeWidth={1.8} />
        </button>
      </div>

      {/* ── Nav Label ── */}
      <p className="px-5 mt-5 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
        Main Menu
      </p>

      {/* ── Nav Items ── */}
      <nav className="flex-1 px-2.5 overflow-y-auto">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== '/users/admin' && pathname.startsWith(href));

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all
                    ${active
                      ? 'text-violet-700 font-semibold'
                      : 'text-gray-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  style={
                    active
                      ? { background: 'linear-gradient(90deg, #ede9fe 0%, #f3f0ff 100%)' }
                      : {}
                  }
                >
                  <Icon
                    size={17}
                    strokeWidth={active ? 2.2 : 1.8}
                    className={active ? 'text-violet-600' : 'text-gray-400'}
                    style={{ flexShrink: 0 }}
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Sign Out ── */}
      <div className="px-3.5 pb-6 pt-3">
        <button
          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-[13.5px] font-semibold text-white transition-all hover:-translate-y-px active:translate-y-0"
          style={{
            background: 'linear-gradient(90deg, #5F33E2 0%, #7C3AED 100%)',
            boxShadow: '0 4px 14px rgba(95,51,226,0.35)',
          }}
        >
          Sign Out
          <LogOut size={15} strokeWidth={2.2} />
        </button>
      </div>
    </aside>
  );
}