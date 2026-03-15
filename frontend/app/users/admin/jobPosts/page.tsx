import { MessageSquare } from 'lucide-react';
import AdminTopbar from '@/components/admin/layout/AdminTopbar';
import DashboardPeriodDropdown from '@/components/admin/dashboard/DashboardPeriodDropdown';
import JobPostStatBar from '@/components/admin/jobPosts/JobPostStatBar';
import JobPostsTable from '@/components/admin/jobPosts/JobPostsTable';
import { companiesService } from '@/lib/admin/companies.service';

export default async function JobPostsPage() {
  const [stats, posts] = await Promise.all([
    companiesService.getStats(),
    companiesService.getJobPosts(),
  ]);

  return (
    <div className="flex min-h-full flex-col">
      <AdminTopbar
        searchPlaceholder="Search job posts"
        rightControl={<DashboardPeriodDropdown />}
      />

      <div className="flex-1 px-6 pb-6">
        <div className="mb-6 flex items-center gap-2">
          <MessageSquare size={24} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-indigo-600">Job Posts</h1>
        </div>

        <JobPostStatBar
          internshipPosts={stats.internshipPosts}
          internshipCompanies={stats.internshipCompanies}
          jobPosts={stats.jobPosts}
          jobCompanies={stats.jobCompanies}
        />

        <JobPostsTable posts={posts} />
      </div>
    </div>
  );
}