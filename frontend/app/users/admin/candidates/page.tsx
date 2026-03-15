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
    <div className="flex flex-col min-h-full">
      <AdminTopbar
        searchPlaceholder="Search candidates"
        rightControl={
          <div className="flex items-center gap-3">
            <CandidateFilterBar />
            <DashboardPeriodDropdown />
          </div>
        }
      />

      <div className="px-6 pb-6 flex-1">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Users size={24} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-indigo-600">Candidates</h1>
        </div>

        {/* Stats */}
        <CandidateStatsBar stats={stats} />

        {/* Table */}
        <CandidatesTable candidates={candidates} />
      </div>
    </div>
  );
}
