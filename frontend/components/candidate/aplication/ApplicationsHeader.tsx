"use client";

import { FileText } from "lucide-react";

export default function ApplicationsHeader() {
  return (
    <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="flex items-center gap-2 text-[34px] font-bold leading-none text-[#4338CA]">
          <FileText size={30} strokeWidth={2.2} className="text-[#4338CA]" />
          Applications
        </h1>
        <p className="mt-2 text-sm text-[#64748B]">
          Manage and review all applications
        </p>
      </div>
    </div>
  );
}
