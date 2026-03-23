"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, ChevronRight } from "lucide-react";

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  location: string;
  onLocationChange: (val: string) => void;
  jobType: string;
  onJobTypeChange: (val: string) => void;
  skillMatch: string;
  onSkillMatchChange: (val: string) => void;
}

function Dropdown({
  value,
  onChange,
  options,
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  icon?: React.ReactNode;
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
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 font-medium hover:border-indigo-300 hover:bg-indigo-50 transition-colors whitespace-nowrap"
      >
        {icon && <span className="text-gray-400">{icon}</span>}
        {value}
        <ChevronDown size={13} className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-1.5 min-w-40 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`flex items-center justify-between w-full px-4 py-2.5 text-sm text-left transition-colors
                ${value === opt ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
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

export default function RecommendationsFilterBar({
  search, onSearchChange,
  location, onLocationChange,
  jobType, onJobTypeChange,
  skillMatch, onSkillMatchChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-7 py-3">
      {/* Search */}
      <div className="relative flex-1 min-w-50">
        <Search size={15} className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" />
        <input
          type="text"
          placeholder="Search jobs"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        />
      </div>

      <Dropdown value={location} onChange={onLocationChange} options={["Location", "Remote", "Onsite", "Hybrid"]} />
      <Dropdown value={jobType} onChange={onJobTypeChange} options={["Job type", "Full time", "Part time", "Internship", "Contract"]} />
      <Dropdown value={skillMatch} onChange={onSkillMatchChange} options={["Skill matched %", "90%+", "80%+", "70%+", "60%+"]} />

      <button className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors bg-white">
        View all <ChevronRight size={14} />
      </button>
    </div>
  );
}