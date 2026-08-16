"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, RotateCcw, X } from "lucide-react";

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  jobType: string;
  onJobTypeChange: (val: string) => void;
  sort: string;
  onSortChange: (val: string) => void;
  period: string;
  onPeriodChange: (val: string) => void;
  onClearFilters?: () => void;
}

function Dropdown({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200
                   rounded-xl text-sm text-gray-700 font-medium hover:border-indigo-300
                   hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2
                   focus:ring-indigo-300 whitespace-nowrap"
      >
        {value}
        <ChevronDown
          size={13}
          className={`text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-1.5 min-w-35 bg-white border
                        border-gray-100 rounded-xl shadow-lg overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`flex items-center justify-between w-full px-4 py-2.5 text-sm
                          text-left transition-colors
                          ${
                            value === opt
                              ? "bg-indigo-50 text-indigo-700 font-semibold"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
            >
              {opt}
              {value === opt && <Check size={13} className="text-indigo-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FilterBar({
  search, onSearchChange,
  status, onStatusChange,
  jobType, onJobTypeChange,
  sort, onSortChange,
  period, onPeriodChange,
  onClearFilters,
}: FilterBarProps) {
  const isFiltered =
    search !== "" ||
    status !== "Status" ||
    jobType !== "Job Type" ||
    sort !== "Newest" ||
    period !== "All Time";

  const handleClear = () => {
    onSearchChange("");
    onStatusChange("Status");
    onJobTypeChange("Job Type");
    onSortChange("Newest");
    onPeriodChange("All Time");
    if (onClearFilters) onClearFilters();
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-50">
        <Search size={15} className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" />
        <input
          type="text"
          placeholder="Search Posts"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900
                     placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute -translate-y-1/2 right-2.5 top-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <Dropdown value={status}  onChange={onStatusChange}  options={["Status", "Active", "Close"]} />
      <Dropdown value={jobType} onChange={onJobTypeChange} options={["Job Type", "Job", "Internship"]} />
      <Dropdown value={sort}    onChange={onSortChange}    options={["Newest", "Oldest"]} />
      <Dropdown value={period}  onChange={onPeriodChange}  options={["All Time", "This Week", "This Month", "Next 3 Months"]} />

      {isFiltered && (
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200
                     text-gray-600 hover:text-gray-800 rounded-xl text-sm font-medium
                     transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300
                     whitespace-nowrap shadow-xs"
        >
          <RotateCcw size={13} />
          Clear Filters
        </button>
      )}
    </div>
  );
}