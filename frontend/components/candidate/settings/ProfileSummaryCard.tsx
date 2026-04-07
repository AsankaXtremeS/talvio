"use client";

import { Mail, MapPin, MoreHorizontal, Phone, SquarePen } from "lucide-react";

interface ProfileSummaryCardProps {
  fullName: string;
  location: string;
  email: string;
  phone: string;
  bio: string;
  skills: string[];
}

export default function ProfileSummaryCard({
  fullName,
  location,
  email,
  phone,
  bio,
  skills,
}: ProfileSummaryCardProps) {
  const initials = fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="rounded-3xl border border-[#E4E8F2] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#A5B4FC] to-[#60A5FA] text-2xl font-bold text-white">
            {initials}
          </div>

          <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#4F46E5] px-3.5 text-xs font-semibold text-[#4F46E5] hover:bg-[#EEF2FF]">
            <SquarePen size={14} />
            Edit Resume
          </button>
        </div>

        <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D8DFF2] text-[#6B7280] hover:bg-[#F8FAFF]">
          <MoreHorizontal size={15} />
        </button>
      </div>

      <div className="mt-5 space-y-2 border-y border-[#E5E7EB] py-4 text-[#4B5563]">
        <p className="flex items-center gap-2 text-xs md:text-sm">
          <MapPin size={14} className="text-[#6B7280]" />
          {location}
        </p>
        <p className="flex items-center gap-2 text-xs md:text-sm">
          <Mail size={14} className="text-[#6B7280]" />
          {email}
        </p>
        <p className="flex items-center gap-2 text-xs md:text-sm">
          <Phone size={14} className="text-[#6B7280]" />
          {phone}
        </p>
      </div>

      <p className="mt-4 text-xs text-[#374151] md:text-sm">{bio}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-[#DBEAFE] px-2.5 py-1 text-[11px] font-semibold text-[#1D4ED8]"
          >
            {skill}
          </span>
        ))}
        <button className="rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[11px] font-semibold text-[#4F46E5]">
          More
        </button>
      </div>
    </section>
  );
}
