"use client";

import { Store } from "lucide-react";

interface ProjectsCardProps {
  company: string;
  role: string;
  period: string;
  bullets: string[];
}

export default function ProjectsCard({ company, role, period, bullets }: ProjectsCardProps) {
  return (
    <section className="rounded-3xl border border-[#E4E8F2] bg-white p-5 shadow-sm">
      <h3 className="border-b border-[#E5E7EB] pb-3 text-lg font-bold text-[#374151]">
        Projects
      </h3>

      <div className="pt-4">
        <div className="flex items-start gap-3">
          <Store size={24} className="mt-1 text-[#65A30D]" />
          <div>
            <p className="text-lg font-bold text-[#1F2937] md:text-xl">{company}</p>
            <p className="mt-2 text-base text-[#4B5563] md:text-lg">{role}</p>
            <p className="mt-2.5 text-xs text-[#9CA3AF] md:text-sm">{period}</p>
          </div>
        </div>

        <ul className="mt-4 list-disc space-y-1.5 pl-5 text-xs leading-snug text-[#4B5563] md:text-sm">
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
