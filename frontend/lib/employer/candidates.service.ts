import { CandidateInfo, CandidateStatus } from "@/types/employer/candidate.types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ── Avatar gradients — all indigo family, matches design system ──
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#C7D2FE,#818CF8)",
  "linear-gradient(135deg,#DDD6FE,#7C3AED)",
  "linear-gradient(135deg,#E0E7FF,#6366F1)",
  "linear-gradient(135deg,#C7D2FE,#4F46E5)",
  "linear-gradient(135deg,#EDE9FE,#8B5CF6)",
  "linear-gradient(135deg,#F0EFFF,#6366F1)",
  "linear-gradient(135deg,#D4D4F7,#4338CA)",
  "linear-gradient(135deg,#C4BBFB,#7C3AED)",
];

export function getAvatarGradient(index: number): string {
  return AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
}

// ── Mock data — remove when backend is ready ──
export const MOCK_CANDIDATES: CandidateInfo[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "Senior Frontend Developer",
    initial: "S",
    experience: "5 years",
    appliedDaysAgo: 2,
    matchScore: 92,
    skills: ["React", "TypeScript", "Node.js", "UI/UX"],
    email: "sarah@example.com",
    status: "Applied",
  },
  {
    id: "2",
    name: "James Perera",
    role: "UI/UX Designer",
    initial: "J",
    experience: "3 years",
    appliedDaysAgo: 1,
    matchScore: 88,
    skills: ["Figma", "Adobe XD", "Prototyping", "CSS"],
    email: "james@example.com",
    status: "Applied",
  },
  {
    id: "3",
    name: "Amara Silva",
    role: "Backend Engineer",
    initial: "A",
    experience: "4 years",
    appliedDaysAgo: 3,
    matchScore: 85,
    skills: ["Node.js", "Express", "PostgreSQL", "Docker"],
    email: "amara@example.com",
    status: "Shortlisted",
  },
  {
    id: "4",
    name: "David Nishantha",
    role: "Full Stack Developer",
    initial: "D",
    experience: "6 years",
    appliedDaysAgo: 5,
    matchScore: 91,
    skills: ["React", "Node.js", "AWS", "TypeScript"],
    email: "david@example.com",
    status: "Shortlisted",
  },
  {
    id: "5",
    name: "Priya Fernando",
    role: "Data Analyst",
    initial: "P",
    experience: "2 years",
    appliedDaysAgo: 4,
    matchScore: 78,
    skills: ["Python", "SQL", "Tableau", "Power BI"],
    email: "priya@example.com",
    status: "Interview Scheduled",
  },
  {
    id: "6",
    name: "Kasun Rathnayake",
    role: "Mobile Developer",
    initial: "K",
    experience: "3 years",
    appliedDaysAgo: 6,
    matchScore: 83,
    skills: ["React Native", "Flutter", "iOS", "Android"],
    email: "kasun@example.com",
    status: "Interview Scheduled",
  },
  {
    id: "7",
    name: "Nimasha Wickrama",
    role: "Product Manager",
    initial: "N",
    experience: "5 years",
    appliedDaysAgo: 7,
    matchScore: 80,
    skills: ["Agile", "Scrum", "Jira", "Roadmapping"],
    email: "nimasha@example.com",
    status: "Hired",
  },
  {
    id: "8",
    name: "Tharaka Mendis",
    role: "DevOps Engineer",
    initial: "T",
    experience: "4 years",
    appliedDaysAgo: 8,
    matchScore: 86,
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
    email: "tharaka@example.com",
    status: "Applied",
  },
];

// ── API functions — uncomment when backend is ready ──

export async function getCandidates(status: CandidateStatus): Promise<CandidateInfo[]> {
  // TODO: uncomment when backend ready
  // const res = await fetch(`${API}/employer/candidates?status=${status}`);
  // if (!res.ok) throw new Error("Failed to fetch candidates");
  // return res.json();

  // Mock: simulate network delay
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_CANDIDATES.filter((c) => c.status === status);
}

export async function getCandidateById(id: string): Promise<CandidateInfo | undefined> {
  // TODO: uncomment when backend ready
  // const res = await fetch(`${API}/employer/candidates/${id}`);
  // if (!res.ok) throw new Error("Failed to fetch candidate");
  // return res.json();

  await new Promise((r) => setTimeout(r, 200));
  return MOCK_CANDIDATES.find((c) => c.id === id);
}