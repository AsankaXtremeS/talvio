// Job and application types
export type JobSummary = {
  id: string;
  title: string;
  company: string;
  location: string;
  workLocation: "Remote" | "Onsite" | "Hybrid";
  jobType: "Full time" | "Part time" | "Intern" | "Contract";
};

export type ApplicationTab = "all" | "active" | "archived";

export type ApplicationStatus = "active" | "archived";

export type ApplicationMeta = {
  status: ApplicationStatus;
  stage: "Applied" | "Reviewed" | "Scheduled" | "Rejected";
  interviewMessage?: string;
};

export type ApplicationCard = JobSummary & ApplicationMeta & {
  applicationId?: string;
};

export type CompanyBadge = {
  icon: string;
  textClassName: string;
  bgClassName: string;
};

// Constants for applications
export const JOBS: Record<string, JobSummary> = {
  "1": {
    id: "1",
    title: "Frontend Developer Intern",
    company: "Google",
    location: "Mountain View, CA",
    workLocation: "Remote",
    jobType: "Intern",
  },
  "2": {
    id: "2",
    title: "Data Analyst Intern",
    company: "Microsoft",
    location: "Redmond, WA",
    workLocation: "Onsite",
    jobType: "Intern",
  },
  "3": {
    id: "3",
    title: "UI/UX Design Intern",
    company: "Figma",
    location: "San Francisco, CA",
    workLocation: "Remote",
    jobType: "Part time",
  },
  "4": {
    id: "4",
    title: "Marketing Intern",
    company: "Airbnb",
    location: "Seattle, WA",
    workLocation: "Hybrid",
    jobType: "Contract",
  },
  "5": {
    id: "5",
    title: "Software Engineer Intern",
    company: "Meta",
    location: "Menlo Park, CA",
    workLocation: "Hybrid",
    jobType: "Full time",
  },
  "6": {
    id: "6",
    title: "Backend Engineer Intern",
    company: "Amazon",
    location: "Austin, TX",
    workLocation: "Onsite",
    jobType: "Contract",
  },
  "7": {
    id: "7",
    title: "Product Analyst Intern",
    company: "Stripe",
    location: "New York, NY",
    workLocation: "Remote",
    jobType: "Part time",
  },
  "8": {
    id: "8",
    title: "AI Research Intern",
    company: "OpenAI",
    location: "San Francisco, CA",
    workLocation: "Hybrid",
    jobType: "Intern",
  },
  "9": {
    id: "9",
    title: "Cloud Engineer Intern",
    company: "Google",
    location: "Sunnyvale, CA",
    workLocation: "Hybrid",
    jobType: "Intern",
  },
  "10": {
    id: "10",
    title: "DevOps Intern",
    company: "Microsoft",
    location: "Seattle, WA",
    workLocation: "Onsite",
    jobType: "Full time",
  },
  "11": {
    id: "11",
    title: "Product Design Intern",
    company: "Figma",
    location: "Remote",
    workLocation: "Remote",
    jobType: "Part time",
  },
  "12": {
    id: "12",
    title: "Machine Learning Intern",
    company: "OpenAI",
    location: "San Jose, CA",
    workLocation: "Hybrid",
    jobType: "Contract",
  },
  "13": {
    id: "13",
    title: "Mobile App Intern",
    company: "Meta",
    location: "Menlo Park, CA",
    workLocation: "Hybrid",
    jobType: "Intern",
  },
  "14": {
    id: "14",
    title: "Security Analyst Intern",
    company: "Amazon",
    location: "Dallas, TX",
    workLocation: "Onsite",
    jobType: "Full time",
  },
  "15": {
    id: "15",
    title: "Business Intelligence Intern",
    company: "Microsoft",
    location: "Austin, TX",
    workLocation: "Hybrid",
    jobType: "Part time",
  },
  "16": {
    id: "16",
    title: "UX Research Intern",
    company: "Google",
    location: "New York, NY",
    workLocation: "Remote",
    jobType: "Contract",
  },
  "17": {
    id: "17",
    title: "Platform Engineer Intern",
    company: "Stripe",
    location: "Seattle, WA",
    workLocation: "Remote",
    jobType: "Intern",
  },
  "18": {
    id: "18",
    title: "Data Science Intern",
    company: "OpenAI",
    location: "San Francisco, CA",
    workLocation: "Hybrid",
    jobType: "Full time",
  },
  "19": {
    id: "19",
    title: "Growth Marketing Intern",
    company: "Airbnb",
    location: "Los Angeles, CA",
    workLocation: "Remote",
    jobType: "Part time",
  },
  "20": {
    id: "20",
    title: "Full Stack Intern",
    company: "Figma",
    location: "San Francisco, CA",
    workLocation: "Hybrid",
    jobType: "Intern",
  },
};

export const APPLICATION_META: Record<string, ApplicationMeta> = {
  "1": {
    status: "active",
    stage: "Scheduled",
    interviewMessage: "Interview scheduled: Tomorrow 10:00 AM",
  },
  "2": {
    status: "active",
    stage: "Reviewed",
  },
  "3": {
    status: "archived",
    stage: "Applied",
  },
  "4": {
    status: "active",
    stage: "Reviewed",
  },
  "5": {
    status: "active",
    stage: "Reviewed",
  },
  "6": {
    status: "archived",
    stage: "Applied",
  },
  "7": {
    status: "active",
    stage: "Scheduled",
    interviewMessage: "Interview scheduled: Monday 11:30 AM",
  },
  "8": {
    status: "active",
    stage: "Applied",
  },
  "9": {
    status: "active",
    stage: "Reviewed",
  },
  "10": {
    status: "archived",
    stage: "Applied",
  },
  "11": {
    status: "active",
    stage: "Scheduled",
    interviewMessage: "Interview scheduled: Friday 2:00 PM",
  },
  "12": {
    status: "active",
    stage: "Reviewed",
  },
  "13": {
    status: "active",
    stage: "Applied",
  },
  "14": {
    status: "archived",
    stage: "Applied",
  },
  "15": {
    status: "active",
    stage: "Reviewed",
  },
  "16": {
    status: "active",
    stage: "Scheduled",
    interviewMessage: "Interview scheduled: Wednesday 9:30 AM",
  },
  "17": {
    status: "active",
    stage: "Reviewed",
  },
  "18": {
    status: "active",
    stage: "Scheduled",
    interviewMessage: "Interview scheduled: Next Tuesday 4:00 PM",
  },
  "19": {
    status: "archived",
    stage: "Applied",
  },
  "20": {
    status: "active",
    stage: "Applied",
  },
};

export const TAB_LABELS: Array<{ key: ApplicationTab; label: string }> = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "archived", label: "Archived" },
];

export const STEP_LABELS: Array<ApplicationMeta["stage"]> = ["Applied", "Reviewed", "Scheduled"];

export const STEP_HINTS: Record<ApplicationMeta["stage"], string> = {
  Applied: "Checked",
  Reviewed: "Checked",
  Scheduled: "Active",
  Rejected: "Terminated",
};

export const STAGE_SHORT_LABELS: Record<ApplicationMeta["stage"], string> = {
  Applied: "Applied",
  Reviewed: "Reviewed",
  Scheduled: "Scheduled",
  Rejected: "Rejected",
};

export const COMPANY_BADGES: Record<string, CompanyBadge> = {
  Google: {
    icon: "G",
    textClassName: "text-[#EA4335]",
    bgClassName: "bg-white",
  },
  Microsoft: {
    icon: "M",
    textClassName: "text-[#2563EB]",
    bgClassName: "bg-[#F3F8FF]",
  },
  Figma: {
    icon: "F",
    textClassName: "text-[#0E7490]",
    bgClassName: "bg-[#ECFEFF]",
  },
  Airbnb: {
    icon: "A",
    textClassName: "text-[#E11D48]",
    bgClassName: "bg-[#FFF1F2]",
  },
  Meta: {
    icon: "M",
    textClassName: "text-[#2563EB]",
    bgClassName: "bg-[#EFF6FF]",
  },
  Amazon: {
    icon: "A",
    textClassName: "text-[#F59E0B]",
    bgClassName: "bg-[#FFFBEB]",
  },
  Stripe: {
    icon: "S",
    textClassName: "text-[#6366F1]",
    bgClassName: "bg-[#EEF2FF]",
  },
  OpenAI: {
    icon: "O",
    textClassName: "text-[#0F172A]",
    bgClassName: "bg-[#F8FAFC]",
  },
};

export const LOCATION_OPTIONS: Array<JobSummary["workLocation"]> = ["Remote", "Onsite", "Hybrid"];
export const JOB_TYPE_OPTIONS: Array<JobSummary["jobType"]> = ["Full time", "Part time", "Intern", "Contract"];
export const ALL_JOB_IDS = Object.keys(JOBS);
