"use client";

import { CalendarCheck2, FileText, Mail } from "lucide-react";

const actions = [
  { label: "Generate Letter", icon: FileText },
  { label: "Contact", icon: Mail },
  { label: "Schedule Interview", icon: CalendarCheck2 },
];

export default function QuickActionsCard() {
  return (
    <section>
      <h2 className="mb-2.5 text-lg font-bold text-[#374151]">Quick Actions</h2>
      <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-[#E4E8F2] bg-white shadow-sm">
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className="flex flex-col items-center gap-1.5 border-r border-[#E4E8F2] px-2.5 py-3 text-center last:border-r-0 hover:bg-[#F8FAFF]"
            >
              <Icon size={16} className="text-[#4F46E5]" />
              <span className="text-xs font-medium text-[#374151]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
