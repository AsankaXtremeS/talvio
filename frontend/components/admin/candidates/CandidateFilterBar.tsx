'use client';

import { ChevronDown, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function FilterDropdown({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 font-medium hover:border-indigo-300 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300 whitespace-nowrap"
      >
        {value}
        <ChevronDown
          size={13}
          className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-1.5 min-w-35 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                value === option
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {option}
              {value === option && <Check size={13} className="text-indigo-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CandidateFilterBar() {
  const [jobRole, setJobRole] = useState('Job Role');
  const [userType, setUserType] = useState('User Type');

  return (
    <div className="flex items-center gap-3">
    
      <FilterDropdown
        value={jobRole}
        onChange={setJobRole}
        options={['Job Role', 'Engineering', 'Design', 'Marketing', 'Management']}
      />
      <FilterDropdown
        value={userType}
        onChange={setUserType}
        options={['User Type', 'Job', 'Internship']}
      />
    </div>
  );
}
