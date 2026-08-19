"use client";

import Link from "next/link";
import type { InterviewItem } from "@/components/candidate/interviews/types";

type InterviewCardProps = {
  interview: InterviewItem;
};

const COMPANY_INITIAL_TEXT: Record<string, string> = {
  Google: "text-[#EA4335]",
  Stripe: "text-[#635BFF]",
  Figma: "text-[#0EA5E9]",
};

export default function InterviewCard({ interview }: InterviewCardProps) {
  const badgeClass = COMPANY_INITIAL_TEXT[interview.company] ?? "text-[#334155]";

  return (
    <article className="rounded-2xl border border-[#DEE3EE] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full border border-[#E7EAF2] bg-[#F8FAFC] text-lg font-bold ${badgeClass}`}>
            {interview.company.charAt(0)}
          </div>

          <div>
            <p className="text-[15px] font-bold text-[#0F172A] md:text-base">{interview.title}</p>
            <p className="text-[13px] font-semibold text-[#4F46E5] md:text-sm">
              {interview.company} - {interview.location}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#D9EFFF] px-3 py-1 text-xs font-semibold text-[#0369A1]">
                {interview.workMode}
              </span>
              <span className="rounded-full bg-[#D9EFFF] px-3 py-1 text-xs font-semibold text-[#0369A1]">
                {interview.jobType}
              </span>
            </div>
          </div>
        </div>

        <Link
          href={`/users/candidate/interviews/${interview.id}`}
          className="rounded-xl bg-[#4F46E5] px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-[#4338CA]"
        >
          View details
        </Link>
      </div>

      <p className="mt-4 flex w-full items-center gap-2 rounded-full border border-[#9FE0B7] bg-[#E8FAEF] px-4 py-2 text-xs font-semibold text-[#1FA55B]">
        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#1FA55B] bg-white text-[10px] leading-none">
          ✓
        </span>
        <span>Interview scheduled: {interview.scheduledLabel}</span>
      </p>
    </article>
  );
}
