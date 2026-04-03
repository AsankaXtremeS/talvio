"use client";

import { Store } from "lucide-react";

interface WorkExperienceCardProps {
  company: string;
  role: string;
  period: string;
}

export default function WorkExperienceCard({ company, role, period }: WorkExperienceCardProps) {
  return (
    <section className="rounded-3xl border border-[#E4E8F2] bg-white p-5 shadow-sm">
      <h3 className="border-b border-[#E5E7EB] pb-3 text-lg font-bold text-[#374151]">
        Work Experience
      </h3>

      <div className="pt-4">
        <div className="flex items-start gap-3">
          <Store size={24} className="mt-1 text-[#65A30D]" />
          <div>
            <p className="text-lg font-bold text-[#1F2937] md:text-xl">{company}</p>
            <p className="mt-2 text-base text-[#6B7280] md:text-lg">{role}</p>
            <p className="mt-2.5 text-xs text-[#9CA3AF] md:text-sm">{period}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
