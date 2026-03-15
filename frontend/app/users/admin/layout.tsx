"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";

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
      <AdminSidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} isMobile />
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      <main className="relative flex flex-col flex-1 min-w-0 overflow-y-auto admin-scroll">
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

        <div className="flex-1 min-h-0">
          {children}
        </div>
      </main>
    </div>
  );
}
