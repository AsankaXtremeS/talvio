import { Users } from 'lucide-react';
import CandidateStatsBar from '@/components/admin/candidates/CandidateStatsBar';
import CandidatesTable from '@/components/admin/candidates/CandidatesTable';
import CandidateFilterBar from '@/components/admin/candidates/CandidateFilterBar';
import DashboardPeriodDropdown from '@/components/admin/dashboard/DashboardPeriodDropdown';
import AdminTopbar from '@/components/admin/layout/AdminTopbar';
import { candidatesService } from '@/lib/admin/candidates.service';

export default async function CandidatesPage() {
  const [stats, candidates] = await Promise.all([
    candidatesService.getStats(),
    candidatesService.getCandidates(),
  ]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <AdminTopbar
        searchPlaceholder="Search candidates"
        rightControl={
          <div className="flex items-center gap-3">
            <CandidateFilterBar />
            <DashboardPeriodDropdown />
          </div>
        }
      />

      <div className="min-h-0 flex flex-1 flex-col px-6 pb-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Users size={24} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-indigo-600">Candidates</h1>
        </div>

        {/* Stats */}
        <CandidateStatsBar stats={stats} />

        {/* Table */}
        <div className="min-h-0 flex-1">
          <CandidatesTable candidates={candidates} />
        </div>
      </div>
    </div>
  );
}
