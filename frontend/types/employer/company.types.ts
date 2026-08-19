export interface Company {
  id: string;
  name: string;
  email: string;
  postCount: number;
  joinedAt: string;
  category?: string;          // shown in "Post count" column as type label
  logoUrl?: string;
  logoText?: string;
  logoColor?: string;
}

export interface JobPost {
  id: string;
  jobTitle: string;
  category: string;           // Department
  type: 'Job' | 'Internship';
  closedDate?: string;        // e.g. "Apr 26,2024"
  isClosed?: boolean;         // shows "Closed (n)" badge instead of View/Edit
  closedApplications?: number;// number shown inside the Closed badge
  // Company info
  companyId: string;
  companyName: string;
  companyEmail: string;
  companyLogoText?: string;
  companyLogoColor?: string;
}

export interface JobPostStats {
  internshipPosts: number;
  internshipCompanies: number;
  jobPosts: number;
  jobCompanies: number;
}

export interface CompanyFilters {
  search: string;
  location: string;
  jobRole: string;
  period: string;
}
