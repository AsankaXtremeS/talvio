"use client";

import { ChevronLeft, Shapes } from "lucide-react";

interface ProfileHeaderProps {
  fullName: string;
  title: string;
}

export default function ProfileHeader({ fullName, title }: ProfileHeaderProps) {
  return (
    <header className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="flex items-center gap-2 text-lg font-bold text-[#2E3192]">
          <Shapes size={22} />
          Profile
        </p>

        <div className="flex items-start gap-2">
          <button className="mt-1 flex h-7 w-7 items-center justify-center rounded-lg border border-[#D8DFF2] bg-white text-[#6B7280]">
            <ChevronLeft size={14} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937] md:text-3xl md:leading-none">
              {fullName}
            </h1>
            <p className="mt-1 text-xs text-[#6B7280] md:mt-1.5 md:text-sm">{title}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
