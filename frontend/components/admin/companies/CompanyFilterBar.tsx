'use client';

import { Search, MapPin, Briefcase, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface CompanyFilterBarProps {
  onSearchChange?: (search: string) => void;
}

function FilterDropdown({ label, icon: Icon }: { label: string; icon: React.ElementType }) {
  return (
    <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 font-medium hover:border-indigo-300 transition-all">
      <Icon size={15} className="text-gray-400" />
      {label}
      <ChevronDown size={13} className="text-gray-400" />
    </button>
  );
}

export default function CompanyFilterBar({ onSearchChange }: CompanyFilterBarProps) {
  const [search, setSearch] = useState('');

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search companies"
          value={search}
          onChange={(e) => { setSearch(e.target.value); onSearchChange?.(e.target.value); }}
          className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all w-56"
        />
      </div>
      <FilterDropdown label="Location" icon={MapPin} />
      <FilterDropdown label="Job Role" icon={Briefcase} />
    </div>
  );
}
