"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronRight, Search, UserRound } from "lucide-react";
import { JOB_TYPE_OPTIONS, LOCATION_OPTIONS, JobSummary } from "@/components/candidate/aplication/types";

interface ApplicationsFiltersProps {
  searchValue: string;
  selectedLocation: "all" | JobSummary["workLocation"];
  selectedJobType: "all" | JobSummary["jobType"];
  onSearchChange: (value: string) => void;
  onLocationChange: (location: "all" | JobSummary["workLocation"]) => void;
  onJobTypeChange: (jobType: "all" | JobSummary["jobType"]) => void;
}

interface FilterDropdownProps {
  value: string;
  defaultLabel: string;
  options: string[];
  onChange?: (value: string) => void;
}

function FilterDropdown({
  value,
  defaultLabel,
  options,
  onChange,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, []);

  const displayValue = value === "all" ? defaultLabel : value;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-12 w-full cursor-pointer items-center justify-between rounded-2xl border bg-white px-5 text-[13px] font-semibold transition-colors ${
          open
            ? "border-[#8EA2FF] text-[#1E2A47]"
            : "border-[#D0D7E5] text-[#334155] hover:bg-[#F8FAFC]"
        }`}
      >
        <span className="flex items-center gap-2">
          <UserRound size={14} className="text-[#64748B]" />
          {displayValue}
        </span>
        <ChevronDown
          size={14}
          className={`text-[#94A3B8] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-[#DEE3EE] bg-white shadow-[0_10px_35px_rgba(15,23,42,0.12)]">
          {options.map((option) => {
            const isSelected = option === value || (value === "all" && option === "all");
            const label = option === "all" ? defaultLabel : option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange?.(option);
                  setOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
                  isSelected
                    ? "bg-[#EEF2FF] font-semibold text-[#4338CA]"
                    : "text-[#334155] hover:bg-[#F8FAFC]"
                }`}
              >
                <span>{label}</span>
                {isSelected ? <Check size={14} className="text-[#4F46E5]" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default function ApplicationsFilters({
  searchValue,
  selectedLocation,
  selectedJobType,
  onSearchChange,
  onLocationChange,
  onJobTypeChange,
}: ApplicationsFiltersProps) {
  const [skillMatch, setSkillMatch] = useState("all");

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[2.8fr_0.95fr_0.95fr_1.1fr_0.8fr]">
      {/* Search Input */}
      <label className="flex h-12 items-center gap-2 rounded-2xl border border-[#D0D7E5] bg-white px-4 text-sm text-[#64748B] md:col-span-2 xl:col-span-1">
        <Search size={16} className="text-[#94A3B8]" />
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search jobs"
          className="h-full w-full border-0 bg-transparent text-sm text-[#334155] outline-none placeholder-[#94A3B8]"
        />
      </label>

      {/* Location Dropdown */}
      <FilterDropdown
        value={selectedLocation}
        defaultLabel="Location"
        options={["all", ...LOCATION_OPTIONS]}
        onChange={(value) => onLocationChange(value as "all" | JobSummary["workLocation"])}
      />

      {/* Job Type Dropdown */}
      <FilterDropdown
        value={selectedJobType}
        defaultLabel="Job type"
        options={["all", ...JOB_TYPE_OPTIONS]}
        onChange={(value) => onJobTypeChange(value as "all" | JobSummary["jobType"])}
      />

      {/* Skill Matched Filter */}
      <FilterDropdown
        value={skillMatch}
        defaultLabel="Skill matched %"
        options={["all", "90%+", "80%+", "70%+", "60%+"]}
        onChange={setSkillMatch}
      />

      {/* View All Button */}
      <button
        type="button"
        className="flex h-12 cursor-pointer items-center justify-between rounded-2xl border border-[#D0D7E5] bg-white px-5 text-[13px] font-semibold text-[#334155] transition-colors hover:bg-[#F8FAFC]"
      >
        <span>View all</span>
        <ChevronRight size={14} className="text-[#94A3B8]" />
      </button>
    </div>
  );
}
