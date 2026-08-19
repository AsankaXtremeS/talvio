// Frontend interview types — names EXACTLY match backend interview.types.ts
// so there is zero confusion when reading both files side by side.
//
// Backend file:  src/modules/employer/interviews/interview.types.ts
// Frontend file: types/employer/interview.types.ts
//
// Shared names: MeetingType, InterviewStatus, InterviewDTO, EmailPreviewDTO
// Frontend-only: CreateInterviewPayload, GenerateEmailPayload (request bodies)

export type MeetingType = "ONLINE" | "ONSITE" | "PHONE";
export type InterviewStatus = "DRAFT" | "SCHEDULED" | "CANCELLED" | "COMPLETED";

// ─── Response Types (mirror backend InterviewDTO exactly) ─────────────────────

/** Mirrors backend InterviewDTO — returned by every interview endpoint */
export interface InterviewDTO {
  id: string;
  status: InterviewStatus;
  scheduledAt: string;          // ISO 8601
  meetingType: MeetingType;
  location?: string | null;
  meetingLink?: string | null;
  googleCalendarLink?: string | null;
  additionalInfo?: string | null;
  emailBody?: string | null;
  emailSentAt?: string | null;
  candidateEmail: string;
  isReschedule?: boolean;       // Temporary flag to indicate reschedule mode
  rescheduledFromId?: string | null;  // ID of the interview being rescheduled
  rescheduledToId?: string | null;    // ID of the interview this one was rescheduled to
  candidate: {
    id: string;
    name: string;
    email: string;
    headline?: string | null;
    skills: string[];
  };
  jobPost: {
    id: string;
    title: string;
    type: string;
    companyName: string;
  };
  employer: {
    companyName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

/** Mirrors backend EmailPreviewDTO — returned by POST /generate-email */
export interface EmailPreviewDTO {
  subject: string;
  body: string;   // Full HTML email body
}

// ─── Request Payload Types (frontend-only — sent TO backend) ──────────────────

/** Payload sent when creating a draft interview — maps to backend CreateInterviewInput */
export interface CreateInterviewPayload {
  jobPostId: string;
  candidateProfileId: string;
  scheduledAt: string;        // ISO 8601
  meetingType: MeetingType;
  meetingLink?: string;
  location?: string;
  additionalInfo?: string;
  emailBody?: string;
  isReschedule?: boolean;
  rescheduledFromId?: string;
}

/** Payload for updating an existing interview */
export interface UpdateInterviewPayload {
  scheduledAt?: string;
  meetingType?: MeetingType;
  meetingLink?: string | null;
  location?: string;
  additionalInfo?: string;
  emailBody?: string;
  isReschedule?: boolean;
  rescheduledFromId?: string | null;
}

/** Payload for generating an email preview — maps to backend GenerateEmailInput */
export interface GenerateEmailPayload {
  jobPostId: string;
  candidateProfileId: string;
  scheduledAt: string;
  meetingType: MeetingType;
  location?: string;
  meetingLink?: string;
  additionalInfo?: string;
  isReschedule?: boolean;
}