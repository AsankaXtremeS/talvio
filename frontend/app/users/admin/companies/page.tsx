import { Building2 } from 'lucide-react';
import CompaniesTable from '@/components/admin/companies/CompaniesTable';
import DashboardPeriodDropdown from '@/components/admin/dashboard/DashboardPeriodDropdown';
import AdminTopbar from '@/components/admin/layout/AdminTopbar';
import { companiesService } from '@/lib/admin/companies.service';

export default async function CompaniesPage() {
  const companies = await companiesService.getCompanies();

  return (
    <div className="flex flex-col min-h-full">
      <AdminTopbar
        searchPlaceholder="Search companies"
        rightControl={<DashboardPeriodDropdown />}
      />

      <div className="px-6 pb-6 flex-1">
        {/* Page Header */}
        <div className="flex items-center gap-2 mb-6">
          <Building2 size={24} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-indigo-600">Companies</h1>
        </div>

        {/* Full-width Companies Table */}
        <CompaniesTable companies={companies} />
      </div>
    </div>
  );
}
