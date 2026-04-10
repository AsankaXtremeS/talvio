import { DashboardJob } from "./RecommendationRow";
import RecommendationRow from "./RecommendationRow";

interface RecommendationListProps {
  jobs: DashboardJob[];
  appliedJobIds: string[];
  activeTab: "recommended" | "applications";
  onView: (jobId: string) => void;
  onApply: (jobId: string) => void;
  onWithdraw: (jobId: string) => void;
}

export default function RecommendationList({ jobs, appliedJobIds, activeTab, onView, onApply, onWithdraw }: RecommendationListProps) {
  if (jobs.length === 0) {
    return <div className="px-6 py-14 text-center text-sm text-gray-400">No results found for your search.</div>;
  }

  return (
    <div>
      {jobs.map((job) => (
        <RecommendationRow
          key={job.id}
          job={job}
          isApplied={appliedJobIds.includes(job.id)}
          showWithdraw={activeTab === "applications"}
          onView={onView}
          onApply={onApply}
          onWithdraw={onWithdraw}
        />
      ))}
    </div>
  );
}
