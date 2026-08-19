import type { Company, JobPost, JobPostStats, CompanyFilters } from '@/types/admin/company.types';

export const companiesService = {
  // ─── Companies ────────────────────────────────────────────────────────────

  async getCompanies(filters?: Partial<CompanyFilters>): Promise<Company[]> {
    const companies: Company[] = [
      {
        id: '1',
        name: 'Tech Solutions',
        email: 'JohnD2024@gmail.com',
        postCount: 5,
        joinedAt: 'Dec 26,2025 10:00AM',
        category: 'Employee',
        logoText: 'Tech',
        logoColor: '#1e3a8a',
      },
      {
        id: '2',
        name: 'Tech Solutions',
        email: 'SarahWilson@email.com',
        postCount: 3,
        joinedAt: 'Dec 26,2025 09:07AM',
        category: 'Employee',
        logoText: 'Tech',
        logoColor: '#1e3a8a',
      },
      {
        id: '3',
        name: 'Tech Solutions',
        email: 'KimDavid@Email.com',
        postCount: 2,
        joinedAt: 'Dec 26,2025 09:01AM',
        category: 'Student',
        logoText: 'Tech',
        logoColor: '#1e3a8a',
      },
      {
        id: '4',
        name: 'Tech Solutions',
        email: 'Rody123Em@gmail.com',
        postCount: 4,
        joinedAt: 'Dec 26,2025 07:50AM',
        category: 'Employee',
        logoText: 'Tech',
        logoColor: '#1e3a8a',
      },
      {
        id: '5',
        name: 'Tech Solutions',
        email: 'Chen2020.Michel@gmail.com',
        postCount: 6,
        joinedAt: 'Dec 26,2025 07:06AM',
        category: 'Employee',
        logoText: 'Tech',
        logoColor: '#1e3a8a',
      },
      {
        id: '6',
        name: 'Tech Solutions',
        email: 'LeeJess.12@gmail.com',
        postCount: 1,
        joinedAt: 'Dec 25,2025 11:32PM',
        category: 'Student',
        logoText: 'Tech',
        logoColor: '#1e3a8a',
      },
    ];

    if (filters?.search) {
      return companies.filter(
        (c) =>
          c.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          c.email.toLowerCase().includes(filters.search!.toLowerCase()),
      );
    }
    return companies;
  },

  async removeCompany(id: string): Promise<void> {
    // Replace with: await fetch(`/api/admin/companies/${id}`, { method: 'DELETE' })
    console.log('Remove company:', id);
  },

  // ─── Job Posts ─────────────────────────────────────────────────────────────

  async getJobPostStats(): Promise<JobPostStats> {
    // Replace with: return fetch('/api/admin/job-posts/stats').then(r => r.json())
    return {
      internshipPosts: 352,
      internshipCompanies: 41,
      jobPosts: 631,
      jobCompanies: 57,
    };
  },

  async getJobPosts(filters?: Partial<CompanyFilters>): Promise<JobPost[]> {
    const posts: JobPost[] = [
      {
        id: '1',
        jobTitle: 'Frontend Developer',
        category: 'Engineering',
        type: 'Job',
        closedDate: 'Apr 26,2024',
        isClosed: false,
        companyId: '1',
        companyName: 'Tech Solutions',
        companyEmail: 'techSol@gmail.com',
        companyLogoText: 'Tech',
        companyLogoColor: '#1e3a8a',
      },
      {
        id: '2',
        jobTitle: 'UI/UX Designer',
        category: 'Design',
        type: 'Internship',
        closedDate: 'Apr 26,2024',
        isClosed: false,
        companyId: '1',
        companyName: 'Tech Solutions',
        companyEmail: 'techSol@gmail.com',
        companyLogoText: 'Tech',
        companyLogoColor: '#1e3a8a',
      },
      {
        id: '3',
        jobTitle: 'Data Analyst',
        category: 'Engineering',
        type: 'Job',
        closedDate: 'Apr 26,2024',
        isClosed: false,
        companyId: '1',
        companyName: 'Tech Solutions',
        companyEmail: 'techSol@gmail.com',
        companyLogoText: 'Tech',
        companyLogoColor: '#1e3a8a',
      },
      {
        id: '4',
        jobTitle: 'Marketing Intern',
        category: 'Marketing',
        type: 'Job',
        closedDate: 'Apr 26,2024',
        isClosed: true,
        closedApplications: 210,
        companyId: '1',
        companyName: 'Tech Solutions',
        companyEmail: 'techSol@gmail.com',
        companyLogoText: 'Tech',
        companyLogoColor: '#1e3a8a',
      },
      {
        id: '5',
        jobTitle: 'QA Engineer',
        category: 'Engineering',
        type: 'Job',
        closedDate: 'Apr 26,2024',
        isClosed: false,
        companyId: '1',
        companyName: 'Tech Solutions',
        companyEmail: 'techSol@gmail.com',
        companyLogoText: 'Tech',
        companyLogoColor: '#1e3a8a',
      },
      {
        id: '6',
        jobTitle: 'Product Manager',
        category: 'Management',
        type: 'Job',
        closedDate: 'Apr 26,2024',
        isClosed: false,
        companyId: '1',
        companyName: 'Tech Solutions',
        companyEmail: 'techSol@gmail.com',
        companyLogoText: 'Tech',
        companyLogoColor: '#1e3a8a',
      },
    ];

    if (filters?.search) {
      return posts.filter(
        (p) =>
          p.jobTitle.toLowerCase().includes(filters.search!.toLowerCase()) ||
          p.companyName.toLowerCase().includes(filters.search!.toLowerCase()),
      );
    }
    return posts;
  },
};
