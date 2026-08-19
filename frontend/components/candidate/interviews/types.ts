export type InterviewStatus = "Scheduled" | "Draft" | "Cancelled" | "Completed";

export type CandidateInterviewDTO = {
  id: string;
  status: "DRAFT" | "SCHEDULED" | "CANCELLED" | "COMPLETED";
  scheduledAt: string;
  meetingType: "ONLINE" | "ONSITE" | "PHONE";
  location: string | null;
  meetingLink: string | null;
  googleCalendarLink: string | null;
  additionalInfo: string | null;
  company: {
    name: string;
    location: string | null;
    description: string | null;
    website: string | null;
    logoUrl: string | null;
  };
  jobPost: {
    id: string;
    title: string;
    type: "JOB" | "INTERNSHIP" | null;
    workMode: "ON_SITE" | "REMOTE" | "HYBRID" | null;
    employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | null;
    stipendType: "PAID" | "UNPAID" | "NEGOTIABLE" | null;
    duration: string | null;
    location: string | null;
    description: string | null;
    responsibilities: string[];
  };
};

export type InterviewItem = {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: "Remote" | "Onsite" | "Hybrid";
  jobType: "Intern" | "Part time" | "Full time" | "Contract";
  stipend: "Paid" | "Unpaid";
  duration: string;
  scheduledLabel: string;
  scheduledAt: string;
  timezone: string;
  meetingLabel: string;
  meetingUrl: string;
  companyProfileUrl: string;
  status: InterviewStatus;
  roleOverview: string;
  companyDescription: string;
  responsibilities: string[];
};

const toDisplayStatus = (status: CandidateInterviewDTO["status"]): InterviewStatus => {
  if (status === "SCHEDULED") return "Scheduled";
  if (status === "DRAFT") return "Draft";
  if (status === "CANCELLED") return "Cancelled";
  return "Completed";
};

const toWorkMode = (mode: CandidateInterviewDTO["jobPost"]["workMode"]): InterviewItem["workMode"] => {
  if (mode === "REMOTE") return "Remote";
  if (mode === "HYBRID") return "Hybrid";
  return "Onsite";
};

const toJobType = (dto: CandidateInterviewDTO): InterviewItem["jobType"] => {
  if (dto.jobPost.type === "INTERNSHIP") return "Intern";
  if (dto.jobPost.employmentType === "PART_TIME") return "Part time";
  if (dto.jobPost.employmentType === "CONTRACT") return "Contract";
  return "Full time";
};

const toStipend = (stipend: CandidateInterviewDTO["jobPost"]["stipendType"]): InterviewItem["stipend"] => {
  if (stipend === "UNPAID") return "Unpaid";
  return "Paid";
};

const toMeetingLabel = (meetingType: CandidateInterviewDTO["meetingType"]): string => {
  if (meetingType === "ONLINE") return "Online meeting";
  if (meetingType === "PHONE") return "Phone call";
  return "Onsite interview";
};

export const mapInterviewToItem = (dto: CandidateInterviewDTO): InterviewItem => {
  const scheduledDate = new Date(dto.scheduledAt);
  const scheduledLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(scheduledDate);

  const timezone = new Intl.DateTimeFormat("en-US", {
    timeZoneName: "short",
  })
    .formatToParts(scheduledDate)
    .find((part) => part.type === "timeZoneName")
    ?.value ?? "Local";

  return {
    id: dto.id,
    title: dto.jobPost.title || "Interview",
    company: dto.company.name || "Company",
    location: dto.jobPost.location || dto.company.location || dto.location || "Location TBD",
    workMode: toWorkMode(dto.jobPost.workMode),
    jobType: toJobType(dto),
    stipend: toStipend(dto.jobPost.stipendType),
    duration: dto.jobPost.duration || "Not specified",
    scheduledLabel,
    scheduledAt: dto.scheduledAt,
    timezone,
    meetingLabel: toMeetingLabel(dto.meetingType),
    meetingUrl: dto.meetingLink || dto.googleCalendarLink || "",
    companyProfileUrl: dto.company.website || "",
    status: toDisplayStatus(dto.status),
    roleOverview: dto.jobPost.description || "Role details will be shared by the company.",
    companyDescription: dto.company.description || "Company description is not available yet.",
    responsibilities: dto.jobPost.responsibilities?.length
      ? dto.jobPost.responsibilities
      : ["Prepare and attend the interview as scheduled."],
  };
};
