'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export type PeriodFilter = 'this-week' | 'this-month' | 'this-year' | 'all-time';

const PERIOD_OPTIONS: Array<{ label: string; value: PeriodFilter }> = [
  { label: 'This Week', value: 'this-week' },
  { label: 'This Month', value: 'this-month' },
  { label: 'This Year', value: 'this-year' },
  { label: 'All Time', value: 'all-time' },
];

interface DashboardPeriodDropdownProps {
  value?: PeriodFilter;
  onChange?: (value: PeriodFilter) => void;
}

export default function DashboardPeriodDropdown({
  value = 'this-week',
  onChange,
}: DashboardPeriodDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = PERIOD_OPTIONS.find((option) => option.value === value) ?? PERIOD_OPTIONS[0];

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 whitespace-nowrap"
      >
        {selectedOption.label}
        <ChevronDown
          size={13}
          className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1.5 min-w-35 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange?.(option.value);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                value === option.value
                  ? 'bg-indigo-50 font-semibold text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {option.label}
              {value === option.value && <Check size={13} className="text-indigo-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}