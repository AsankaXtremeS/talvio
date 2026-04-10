export type InterviewStatus = "Scheduled";

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

export const INTERVIEWS: InterviewItem[] = [
  {
    id: "google-frontend-intern",
    title: "Frontend Developer Intern",
    company: "Google",
    location: "Mountain View, CA",
    workMode: "Remote",
    jobType: "Intern",
    stipend: "Paid",
    duration: "3 months",
    scheduledLabel: "Tomorrow 10:00 AM",
    scheduledAt: "2026-04-11T10:00:00-07:00",
    timezone: "PDT",
    meetingLabel: "Google Meet",
    meetingUrl: "https://meet.google.com/xyz-abcd-efg",
    companyProfileUrl: "https://about.google/",
    status: "Scheduled",
    roleOverview:
      "Help build and ship product-facing frontend experiences with modern React patterns.",
    companyDescription:
      "Google builds products that organize information and make it universally accessible and useful.",
    responsibilities: [
      "Support feature development with senior frontend engineers",
      "Build reusable UI components and improve accessibility",
      "Partner with product and design teams during sprint execution",
    ],
  },
  {
    id: "stripe-product-analyst-intern",
    title: "Product Analyst Intern",
    company: "Stripe",
    location: "New York, NY",
    workMode: "Remote",
    jobType: "Part time",
    stipend: "Paid",
    duration: "4 months",
    scheduledLabel: "Monday 11:30 AM",
    scheduledAt: "2026-04-13T11:30:00-04:00",
    timezone: "EDT",
    meetingLabel: "Zoom",
    meetingUrl: "https://zoom.us/j/88991234123",
    companyProfileUrl: "https://stripe.com/",
    status: "Scheduled",
    roleOverview:
      "Work with product and data teams to translate insights into roadmap decisions.",
    companyDescription:
      "Stripe builds programmable financial infrastructure for internet businesses of all sizes.",
    responsibilities: [
      "Analyze product usage trends and conversion funnels",
      "Create dashboards for weekly business review",
      "Present actionable insights to cross-functional teams",
    ],
  },
  {
    id: "figma-uiux-intern",
    title: "UI/UX Design Intern",
    company: "Figma",
    location: "San Francisco, CA",
    workMode: "Hybrid",
    jobType: "Intern",
    stipend: "Paid",
    duration: "3 months",
    scheduledLabel: "Wednesday 03:00 PM",
    scheduledAt: "2026-04-15T15:00:00-07:00",
    timezone: "PDT",
    meetingLabel: "Figma Interview Room",
    meetingUrl: "https://figma.com/interview-room/ux-2026-15",
    companyProfileUrl: "https://www.figma.com/company/",
    status: "Scheduled",
    roleOverview:
      "Collaborate on product interaction and visual systems for design tooling experiences.",
    companyDescription:
      "Figma helps teams design, prototype, and build products together in real time.",
    responsibilities: [
      "Translate product requirements into wireframes and prototypes",
      "Run quick usability checks with design peers",
      "Document interaction decisions with clear rationale",
    ],
  },
];

export const INTERVIEWS_BY_ID: Record<string, InterviewItem> = INTERVIEWS.reduce(
  (acc, interview) => {
    acc[interview.id] = interview;
    return acc;
  },
  {} as Record<string, InterviewItem>,
);
