"use client";

import { ApplicationTab, TAB_LABELS } from "@/components/candidate/aplication/types";

interface ApplicationsTabsProps {
  activeTab: ApplicationTab;
  tabCounts: Record<ApplicationTab, number>;
  onTabChange: (tab: ApplicationTab) => void;
}

export default function ApplicationsTabs({
  activeTab,
  tabCounts,
  onTabChange,
}: ApplicationsTabsProps) {
  const uniqueTabs = TAB_LABELS.filter(
    (tab, index, arr) => arr.findIndex((item) => item.key === tab.key) === index
  );

  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-[#DCE1EC] bg-white">
      {uniqueTabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`h-10 cursor-pointer border-r border-[#DCE1EC] text-xs font-semibold last:border-r-0 transition-colors ${
              isActive
                ? "bg-[#E7E9FF] text-[#4F46E5]"
                : "bg-white text-[#64748B] hover:bg-[#F8FAFC]"
            }`}
          >
            {tab.label} ({tabCounts[tab.key]})
          </button>
        );
      })}
    </div>
  );
}
