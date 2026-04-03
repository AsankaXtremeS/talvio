export interface CandidateSettingsProfile {
  fullName: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  bio: string;
  skills: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  education: {
    degree: string;
    field: string;
    period: string;
  };
  project: {
    company: string;
    role: string;
    period: string;
    bullets: string[];
  };
  experience: {
    company: string;
    role: string;
    period: string;
  };
}
