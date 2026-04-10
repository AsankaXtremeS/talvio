"use client";

interface EducationCardProps {
  degree: string;
  field: string;
  period: string;
}

export default function EducationCard({ degree, field, period }: EducationCardProps) {
  return (
    <section className="rounded-3xl border border-[#E4E8F2] bg-white p-5 shadow-sm">
      <h3 className="border-b border-[#E5E7EB] pb-3 text-lg font-bold text-[#374151]">
        Education
      </h3>

      <div className="pt-4">
        <p className="text-lg font-bold text-[#1F2937] md:text-xl">{degree}</p>
        <p className="mt-2 text-base text-[#6B7280] md:text-lg">{field}</p>
        <p className="mt-2.5 text-xs text-[#9CA3AF] md:text-sm">{period}</p>
      </div>
    </section>
  );
}
