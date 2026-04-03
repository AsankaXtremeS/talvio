"use client";

import { useRouter } from "next/navigation";
import {
  ApplicationCard as ApplicationCardType,
  ApplicationMeta,
  COMPANY_BADGES,
  STAGE_SHORT_LABELS,
  STEP_HINTS,
  STEP_LABELS,
} from "@/components/candidate/aplication/types";

interface ApplicationCardProps {
  job: ApplicationCardType;
  onApply?: (jobId: string) => void;
  getStepState?: (
    currentStage: ApplicationMeta["stage"],
    step: ApplicationMeta["stage"]
  ) => "done" | "current" | "pending";
  getStageProgress?: (stage: ApplicationMeta["stage"]) => number;
}

export default function ApplicationCard({
  job,
  onApply,
  getStepState,
  getStageProgress,
}: ApplicationCardProps) {
  const router = useRouter();

  const badge = COMPANY_BADGES[job.company] ?? {
    icon: job.company.slice(0, 1).toUpperCase(),
    textClassName: "text-[#4B5563]",
    bgClassName: "bg-white",
  };

  const handleApply = () => {
    if (onApply) {
      onApply(job.id);
    } else {
      router.push(`/users/candidate/dashboard/apply_job?jobId=${job.id}`);
    }
  };

  // Default implementations if not provided
  const defaultGetStepState = (
    currentStage: ApplicationMeta["stage"],
    step: ApplicationMeta["stage"]
  ): "done" | "current" | "pending" => {
    const currentIndex = STEP_LABELS.indexOf(currentStage);
    const stepIndex = STEP_LABELS.indexOf(step);

    if (stepIndex < currentIndex) return "done";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  const defaultGetStageProgress = (stage: ApplicationMeta["stage"]): number => {
    const stageIndex = STEP_LABELS.indexOf(stage);
    const maxIndex = STEP_LABELS.length - 1;

    if (stageIndex <= 0) return 0;
    if (stageIndex >= maxIndex) return 100;
    return (stageIndex / maxIndex) * 100;
  };

  const stepStateFunc = getStepState || defaultGetStepState;
  const stageProgressFunc = getStageProgress || defaultGetStageProgress;

  return (
    <article className="rounded-2xl border border-[#DEE3EE] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Company Badge */}
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full border border-[#E7EAF2] text-sm font-bold shadow-sm ${badge.bgClassName} ${badge.textClassName}`}
          >
            {badge.icon}
          </div>

          {/* Job Info */}
          <div>
            <p className="text-[15px] font-bold text-[#0F172A]">{job.title}</p>
            <p className="text-[13px] font-semibold text-[#4F46E5]">
              {job.company} - {job.location}
            </p>

            {/* Tags */}
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#D9EFFF] px-2.5 py-0.5 text-[11px] font-semibold text-[#0369A1]">
                {job.workLocation}
              </span>
              <span className="rounded-full bg-[#D9EFFF] px-2.5 py-0.5 text-[11px] font-semibold text-[#0369A1]">
                {job.jobType}
              </span>
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApply}
          className="cursor-pointer rounded-xl bg-[#4F46E5] px-6 py-2 text-sm font-bold text-white hover:bg-[#4338CA] transition-colors"
        >
          View details
        </button>
      </div>

      {/* Interview Message or Progress Tracker */}
      {job.interviewMessage ? (
        <p className="mt-3 flex w-full items-center gap-2 rounded-full border border-[#9FE0B7] bg-[#E8FAEF] px-4 py-1.5 text-[11px] font-semibold text-[#1FA55B]">
          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#1FA55B] bg-white text-[10px] leading-none">
            ✓
          </span>
          <span>{job.interviewMessage}</span>
        </p>
      ) : (
        <div className="mt-4">
          <div className="relative px-1">
            {/* Progress bar background */}
            <span className="absolute left-[8px] right-[8px] top-2 block h-[2px] bg-[#CDD6EA]" />

            {/* Progress bar fill */}
            <span
              className="absolute left-[8px] top-2 block h-[2px] bg-[#22C55E] transition-all"
              style={{ width: `calc((100% - 16px) * ${stageProgressFunc(job.stage) / 100})` }}
            />

            {/* Steps */}
            <div className="relative grid grid-cols-3">
              {STEP_LABELS.map((step) => {
                const state = stepStateFunc(job.stage, step);

                return (
                  <div key={step} className="relative z-10 flex flex-col items-center text-center">
                    {state === "done" ? (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#22C55E] bg-[#22C55E] text-[10px] font-bold text-white">
                        ✓
                      </span>
                    ) : (
                      <span
                        className={`h-4 w-4 rounded-full border ${
                          state === "current"
                            ? "border-[#22C55E] bg-white"
                            : "border-[#CDD6EA] bg-white"
                        }`}
                      />
                    )}
                    <span className="mt-1 text-[9px] font-medium text-[#475569]">
                      {STAGE_SHORT_LABELS[step]}
                    </span>
                    <span className="text-[8px] text-[#94A3B8]">
                      {state === "pending" ? "Waiting" : STEP_HINTS[step]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
