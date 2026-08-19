import { JobStatus } from "@/types/employer/jobPost.types";

interface JobStatusBadgeProps {
  status: JobStatus;
  count?: number; // shown for Closed: "Closed (210)"
}

const styles: Record<JobStatus, string> = {
  Draft:  "border border-yellow-400 text-yellow-600 bg-yellow-50",
  Active: "border border-green-400 text-green-600 bg-green-50",
  Closed: "border border-red-400 text-red-600 bg-red-50",
};

export default function JobStatusBadge({ status, count }: JobStatusBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
        ${styles[status]}
      `}
    >
      {status}
      {status === "Closed" && count !== undefined && ` (${count})`}
    </span>
  );
}