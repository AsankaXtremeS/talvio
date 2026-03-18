import { LayoutDashboard, CalendarDays, Users, Building2, Star, Flag } from 'lucide-react';
import AdminTopbar from '@/components/admin/layout/AdminTopbar';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import UserGrowthChart from '@/components/admin/dashboard/UserGrowthChart';
import { CandidatesCompaniesActivityChart } from '@/components/admin/dashboard/CandidatesCompaniesActivityChart';
import RecentCandidatesWidget from '@/components/admin/dashboard/RecentCandidatesWidget';
import DashboardPeriodDropdown from '@/components/admin/dashboard/DashboardPeriodDropdown';
import { dashboardService } from '@/lib/admin/dashboard.service';

export default async function DashboardPage() {
  const [stats, userGrowth, candidatesCompaniesActivity, recentCandidates, appStats] =
    await Promise.all([
      dashboardService.getStats(),
      dashboardService.getUserGrowth(),
      dashboardService.getCandidatesCompaniesActivity(),
      dashboardService.getRecentCandidates(),
      dashboardService.getApplicationStats(),
    ]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <AdminTopbar
        showSearch={false}
        filters={
          <div>
            <div className="mb-1 flex items-center gap-2">
              <LayoutDashboard size={24} className="text-indigo-600" />
              <h1 className="text-2xl font-bold text-indigo-600">Dashboard</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CalendarDays size={14} />
              <span>{today}</span>
            </div>
          </div>
        }
        rightControl={<DashboardPeriodDropdown />}
      />

      <div className="min-h-0 flex flex-1 flex-col px-6 pb-6">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatsCard title="Total Users" value={stats.totalUsers} icon={Users} />
          <StatsCard title="Total Companies" value={stats.totalCompanies} icon={Building2} />
          <StatsCard title="Reviews" value={stats.reviews} icon={Star} />
          <StatsCard title="Reports" value={stats.reports} icon={Flag} />
        </div>

        <div className="admin-scroll min-h-0 flex-1 overflow-y-auto">
          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* User Growth */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">User Growth (last 6 months)</h3>
              <UserGrowthChart data={userGrowth} />
              <RecentCandidatesWidget candidates={recentCandidates} newCount={11} />
            </div>

            {/* Candidates & Companies Activity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Candidates &amp; Companies Activity</h3>
              <CandidatesCompaniesActivityChart data={candidatesCompaniesActivity} />

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { value: appStats.applied, label: 'applicants have applied for jobs this month', growth: appStats.appliedGrowth, up: true },
                  { value: appStats.hired, label: 'applicants have hired for jobs this month', growth: appStats.hiredGrowth, up: true },
                  { value: appStats.scheduled, label: 'applicants have scheduled interviews this month', growth: appStats.scheduledGrowth, up: true },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
                    <p className="text-2xl font-bold text-gray-900">{item.value.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-2 leading-snug">{item.label}</p>
                    <p className={`text-sm font-semibold mt-3 ${item.up ? 'text-green-500' : 'text-red-500'}`}>
                      {item.up ? '▲' : '▼'} {item.growth}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
