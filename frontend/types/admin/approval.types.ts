export interface PendingApproval {
  id: string;
  companyName: string;
  companyLogoUrl?: string; // optional — falls back to icon
  createdAt: string;       // ISO date string  e.g. "2025-12-26T10:00:00Z"
  email: string;
  status: "pending" | "approved" | "rejected";
}