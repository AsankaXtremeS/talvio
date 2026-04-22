// Service layer for interview scheduling.
// Owns all business logic: ownership checks, Google Calendar integration,
// email generation, draft management, and confirmation.
//
// Controllers call service methods — never the repository directly.
// Repository calls are always scoped to the authenticated employerId for security.

import { prisma } from "../../../config/db";
import { interviewRepository } from "./interview.repository";
import { CreateInterviewInput, UpdateInterviewInput, GenerateEmailInput } from "./interview.validation";
import { googleCalendarService } from "../../../utils/googleCalendar";
import {
  buildInterviewEmailHtml,
  buildInterviewEmailSubject,
  sendInterviewEmail,
  InterviewEmailData,
} from "../../../utils/interviewEmail";
import { InterviewDTO } from "./interview.types";

// ─── Error helpers ────────────────────────────────────────────────────────────

interface ServiceError extends Error {
  statusCode?: number;
}

const buildHttpError = (message: string, statusCode: number): ServiceError => {
  const err: ServiceError = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// ─── DTO mapper ───────────────────────────────────────────────────────────────

/**
 * Map a raw Prisma interview record to the clean DTO sent to the frontend.
 * SECURITY: This is the single place where we control what data leaves the API.
 */
function mapToDTO(raw: any): InterviewDTO {
  const candidateName = [
    raw.candidate?.user?.firstName,
    raw.candidate?.user?.lastName,
  ]
    .filter(Boolean)
    .join(" ") || "Candidate";

  const employerName = [
    raw.employer?.user?.firstName,
    raw.employer?.user?.lastName,
  ]
    .filter(Boolean)
    .join(" ") || raw.employer?.companyName || "Employer";

  return {
    id: raw.id,
    status: raw.status,
    scheduledAt: raw.scheduledAt.toISOString(),
    meetingType: raw.meetingType,
    location: raw.location ?? null,
    meetingLink: raw.meetingLink ?? null,
    googleCalendarLink: raw.googleCalendarLink ?? null,
    additionalInfo: raw.additionalInfo ?? null,
    emailBody: raw.emailBody ?? null,
    emailSentAt: raw.emailSentAt ? raw.emailSentAt.toISOString() : null,
    candidateEmail: raw.candidateEmail,
    rescheduledFromId: raw.rescheduledFromId ?? null,
    rescheduledToId: raw.rescheduledToId ?? null,
    candidate: {
      id: raw.candidate?.id ?? "",
      name: candidateName,
      email: raw.candidate?.user?.email ?? raw.candidateEmail,
      headline: raw.candidate?.headline ?? null,
      skills: raw.candidate?.skills ?? [],
    },
    jobPost: {
      id: raw.jobPost?.id ?? "",
      title: raw.jobPost?.title ?? "",
      type: raw.jobPost?.type === "JOB" ? "Job" : "Internship",
      companyName: raw.employer?.companyName ?? "",
    },
    employer: {
      companyName: raw.employer?.companyName ?? "",
      email: raw.employer?.user?.email ?? "",
    },
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };
}

// ─── Helper to build email data from raw record ───────────────────────────────

function buildEmailData(raw: any, customBody?: string | null): InterviewEmailData {
  const candidateName = [
    raw.candidate?.user?.firstName,
    raw.candidate?.user?.lastName,
  ]
    .filter(Boolean)
    .join(" ") || "Candidate";

  const senderName = [
    raw.employer?.user?.firstName,
    raw.employer?.user?.lastName,
  ]
    .filter(Boolean)
    .join(" ") || raw.employer?.companyName || "Hiring Team";

  // Check if this is a reschedule by looking at rescheduledFromId or isReschedule flag
  const isReschedule = !!(raw.rescheduledFromId || raw.isReschedule);

  return {
    candidateName,
    candidateEmail: raw.candidateEmail ?? raw.candidate?.user?.email ?? "",
    jobTitle: raw.jobPost?.title ?? "",
    companyName: raw.employer?.companyName ?? "",
    senderName,
    senderEmail: raw.employer?.user?.email ?? "",
    scheduledAt: raw.scheduledAt,
    meetingType: raw.meetingType,
    location: raw.location,
    meetingLink: raw.meetingLink,
    additionalInfo: raw.additionalInfo,
    isReschedule,
    customBody: customBody ?? raw.emailBody ?? null,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

// Helper to convert User ID to Employer Profile ID
async function getEmployerProfileId(userId: string): Promise<string> {
  const employerProfile = await prisma.employerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!employerProfile) {
    throw buildHttpError("Employer profile not found", 404);
  }
  return employerProfile.id;
}

export const interviewService = {
  /**
   * Fetch candidate profile details for schedule UI.
   */
  async getCandidateProfile(employerId: string, candidateProfileId: string) {
    // Ensure requester is a valid employer account.
    await getEmployerProfileId(employerId);

    const candidate = await interviewRepository.findCandidateProfile(candidateProfileId);
    if (!candidate) {
      throw buildHttpError("Candidate profile not found", 404);
    }

    const fullName = [candidate.user.firstName, candidate.user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || "Candidate";

    return {
      id: candidate.id,
      name: fullName,
      email: candidate.user.email,
      headline: candidate.headline ?? "",
      skills: candidate.skills ?? [],
    };
  },

  /**
   * Create a draft interview.
   * For ONLINE meetings, creates a Google Calendar event with Meet link.
   * For ONSITE, creates a calendar event with location.
   * Does NOT send email yet — that happens in scheduleAndSend.
   */
  async createDraft(employerId: string, input: CreateInterviewInput): Promise<InterviewDTO> {
    // 0. Convert User ID to Employer Profile ID
    const employerProfileId = await getEmployerProfileId(employerId);

    // 1. Verify the job post belongs to this employer
    const jobPost = await interviewRepository.findJobPostForEmployer(input.jobPostId, employerProfileId);
    if (!jobPost) {
      throw buildHttpError("Job post not found or you do not have access", 404);
    }

    // 2. Try to find application; if not found, fetch candidate profile directly
    let candidateEmail: string;
    let candidateName: string;

    const application = await interviewRepository.findApplication(
      input.candidateProfileId,
      input.jobPostId
    );

    if (application) {
      // Application exists — use it
      candidateEmail = application.candidateProfile.user.email;
      candidateName = [
        application.candidateProfile.user.firstName,
        application.candidateProfile.user.lastName,
      ]
        .filter(Boolean)
        .join(" ") || "Candidate";
    } else {
      // No application — fetch candidate profile directly (allows testing without formal applications)
      const candidate = await interviewRepository.findCandidateProfile(input.candidateProfileId);
      if (!candidate) {
        throw buildHttpError("Candidate profile not found", 404);
      }
      candidateEmail = candidate.user.email;
      candidateName = [candidate.user.firstName, candidate.user.lastName]
        .filter(Boolean)
        .join(" ") || "Candidate";
    }

    // 3. Parse scheduledAt
    const scheduledAt = new Date(input.scheduledAt);

    // 4. For ONLINE: create Google Calendar event with Meet link (or use fallback)
    let meetingLink: string | undefined;
    let googleCalendarEventId: string | undefined;
    let googleCalendarLink: string | undefined;

    if (input.meetingType === "ONLINE") {
      if (googleCalendarService.isConfigured()) {
        // Try to create Google Calendar event with Meet link
        try {
          const calEvent = await googleCalendarService.createEvent({
            title: `Interview – ${candidateName} | ${jobPost.title}`,
            description: `Interview for ${jobPost.title} at ${jobPost.employer.companyName}`,
            startTime: scheduledAt,
            durationMinutes: 60,
            attendeeEmails: [candidateEmail],
            generateMeetLink: true,
          });

          meetingLink = calEvent.meetLink;
          googleCalendarEventId = calEvent.eventId;
          googleCalendarLink = calEvent.calendarLink;
        } catch (calErr) {
          // Log but don't fail — calendar is optional enhancement
          console.error("Google Calendar event creation failed:", calErr);
          // Fallback: generate a simple meeting link using interview ID
          meetingLink = `https://meet.jitsi.org/talvio-interview-${input.jobPostId.substring(0, 8)}`;
        }
      } else {
        // No Google Calendar configured — generate fallback meeting link
        // Use Jitsi Meet (free, no setup required)
        meetingLink = `https://meet.jitsi.org/talvio-interview-${input.jobPostId.substring(0, 8)}`;
        console.log(`Generated fallback Jitsi Meet link: ${meetingLink}`);
      }
    } else if (input.meetingType === "ONSITE" && googleCalendarService.isConfigured()) {
      // Create calendar event without Meet link for ONSITE
      try {
        const calEvent = await googleCalendarService.createEvent({
          title: `Interview – ${jobPost.title} (On-Site)`,
          description: `On-site interview at ${input.location}`,
          startTime: scheduledAt,
          durationMinutes: 60,
          location: input.location,
          attendeeEmails: [candidateEmail],
          generateMeetLink: false,
        });

        googleCalendarEventId = calEvent.eventId;
        googleCalendarLink = calEvent.calendarLink;
      } catch (calErr) {
        console.error("Google Calendar event creation failed:", calErr);
      }
    }

    // 5. Persist draft interview to database
    const created = await interviewRepository.create(
      employerProfileId,
      input,
      scheduledAt,
      candidateEmail,
      { meetingLink, googleCalendarEventId, googleCalendarLink }
    );

    console.log(`[Interview Created] ID: ${created.id}, Type: ${input.meetingType}, MeetingLink: ${meetingLink}`);
    return mapToDTO(created);
  },

  /**
   * Get a single interview by ID.
   * SECURITY: scoped to authenticated employerId.
   */
  async getById(id: string, employerId: string): Promise<InterviewDTO> {
    const employerProfileId = await getEmployerProfileId(employerId);
    const interview = await interviewRepository.findById(id, employerProfileId);
    if (!interview) {
      throw buildHttpError("Interview not found", 404);
    }
    return mapToDTO(interview);
  },

  /**
   * List all interviews for this employer.
   */
  async list(
    employerId: string,
    options: { status?: string; page?: number; limit?: number }
  ) {
    const employerProfileId = await getEmployerProfileId(employerId);
    const { total, interviews } = await interviewRepository.findAll(employerProfileId, options);

    return {
      data: interviews.map(mapToDTO),
      pagination: {
        total,
        page: options.page ?? 1,
        limit: options.limit ?? 20,
        totalPages: Math.ceil(total / (options.limit ?? 20)),
      },
    };
  },

  /**
   * Get all dates in a month that have scheduled interviews.
   * Used to show dots on the calendar.
   */
  async getScheduledDates(
    employerId: string,
    year: number,
    month: number
  ): Promise<string[]> {
    const employerProfileId = await getEmployerProfileId(employerId);
    return interviewRepository.getScheduledDates(employerProfileId, year, month);
  },

  /**
   * Update draft interview data (date, time, type, etc.).
   * Regenerates Google Calendar event if time changed.
   */
  async updateDraft(
    id: string,
    employerId: string,
    input: UpdateInterviewInput
  ): Promise<InterviewDTO> {
    const employerProfileId = await getEmployerProfileId(employerId);
    const existing = await interviewRepository.findById(id, employerProfileId);
    if (!existing) {
      throw buildHttpError("Interview not found", 404);
    }

    // Cannot update a sent interview (SCHEDULED) — only DRAFT allowed
    if ((existing as any).status === "SCHEDULED") {
      throw buildHttpError(
        "Cannot edit a scheduled interview. Cancel it first.",
        400
      );
    }

    const updateData: any = {};

    if (input.scheduledAt) {
      updateData.scheduledAt = new Date(input.scheduledAt);
    }
    if (input.meetingType !== undefined) updateData.meetingType = input.meetingType;
    if (input.location !== undefined) updateData.location = input.location;
    if (input.additionalInfo !== undefined) updateData.additionalInfo = input.additionalInfo;
    if (input.emailBody !== undefined) updateData.emailBody = input.emailBody;
    if (input.status !== undefined) updateData.status = input.status;

    const updated = await interviewRepository.update(id, employerProfileId, updateData);
    return mapToDTO(updated);
  },

  /**
   * Generate an email preview (subject + HTML body) based on current form data.
   * Does NOT save anything — purely for frontend display.
   */
  async generateEmailPreview(
    employerId: string,
    input: GenerateEmailInput
  ): Promise<{ subject: string; body: string }> {
    const employerProfileId = await getEmployerProfileId(employerId);
    // Fetch job post and candidate for real data in preview
    const [jobPost, candidate] = await Promise.all([
      interviewRepository.findJobPostForEmployer(input.jobPostId, employerProfileId),
      interviewRepository.findCandidateProfile(input.candidateProfileId),
    ]);

    if (!jobPost) throw buildHttpError("Job post not found", 404);
    if (!candidate) throw buildHttpError("Candidate profile not found", 404);

    const candidateName = [candidate.user.firstName, candidate.user.lastName]
      .filter(Boolean)
      .join(" ") || "Candidate";

    const senderName = [
      jobPost.employer.user.firstName,
      jobPost.employer.user.lastName,
    ]
      .filter(Boolean)
      .join(" ") || jobPost.employer.companyName;

    const emailData: InterviewEmailData = {
      candidateName,
      candidateEmail: candidate.user.email,
      jobTitle: jobPost.title,
      companyName: jobPost.employer.companyName,
      senderName,
      senderEmail: jobPost.employer.user.email,
      scheduledAt: new Date(input.scheduledAt),
      meetingType: input.meetingType,
      location: input.location,
      meetingLink: input.meetingLink,
      additionalInfo: input.additionalInfo,
      isReschedule: input.isReschedule,
      customBody: null,
    };

    return {
      subject: buildInterviewEmailSubject(emailData),
      body: buildInterviewEmailHtml(emailData),
    };
  },

  /**
   * Confirm and send the interview invitation email.
   * Changes status from DRAFT → SCHEDULED.
   * Records the time the email was sent.
   */
  async scheduleAndSend(id: string, employerId: string): Promise<InterviewDTO> {
    const employerProfileId = await getEmployerProfileId(employerId);
    const existing = await interviewRepository.findById(id, employerProfileId);
    if (!existing) {
      throw buildHttpError("Interview not found", 404);
    }

    if ((existing as any).status === "SCHEDULED") {
      throw buildHttpError("Email has already been sent for this interview", 400);
    }

    const emailData = buildEmailData(existing as any);

    // Send the email — throws if SMTP fails
    console.log(`[ScheduleAndSend] Interview ID: ${id}, Email recipient: ${emailData.candidateEmail}, MeetingType: ${emailData.meetingType}, MeetingLink: ${emailData.meetingLink}`);
    await sendInterviewEmail(emailData);

    // Update status to SCHEDULED and record send time
    const updated = await interviewRepository.update(id, employerProfileId, {
      status: "SCHEDULED",
      emailSentAt: new Date(),
    });

    return mapToDTO(updated);
  },

  /**
   * Cancel an interview (DRAFT or SCHEDULED).
   * Removes the Google Calendar event if one exists.
   */
  async cancel(id: string, employerId: string): Promise<void> {
    const employerProfileId = await getEmployerProfileId(employerId);
    const existing = await interviewRepository.findById(id, employerProfileId);
    if (!existing) {
      throw buildHttpError("Interview not found", 404);
    }

    const googleEventId = (existing as any).googleCalendarEventId;
    if (googleEventId && googleCalendarService.isConfigured()) {
      try {
        await googleCalendarService.deleteEvent(googleEventId);
      } catch (err) {
        console.error("Failed to delete Google Calendar event:", err);
      }
    }

    // Mark as CANCELLED instead of hard delete (keeps record for history/reference)
    await interviewRepository.update(id, employerProfileId, { status: "CANCELLED" });
    console.log(`[Interview Cancelled] ID: ${id}`);
  },

  /**
   * Save the custom email body for a draft interview.
   * Called when the employer edits the email in the preview panel.
   */
  async saveEmailBody(
    id: string,
    employerId: string,
    emailBody: string
  ): Promise<InterviewDTO> {
    const employerProfileId = await getEmployerProfileId(employerId);
    const existing = await interviewRepository.findById(id, employerProfileId);
    if (!existing) {
      throw buildHttpError("Interview not found", 404);
    }

    const updated = await interviewRepository.update(id, employerProfileId, {
      emailBody,
    });

    return mapToDTO(updated);
  },

  /**
   * Generate a cancellation email preview.
   * Returns subject and body for the cancellation email.
   */
  async generateCancelEmailPreview(
    id: string,
    employerId: string,
    reason: string
  ): Promise<{ subject: string; body: string }> {
    const employerProfileId = await getEmployerProfileId(employerId);
    const interview = await interviewRepository.findById(id, employerProfileId);
    if (!interview) {
      throw buildHttpError("Interview not found", 404);
    }

    const candidateName = [
      (interview as any).candidate?.user?.firstName,
      (interview as any).candidate?.user?.lastName,
    ]
      .filter(Boolean)
      .join(" ") || "Candidate";

    const companyName =
      (interview as any).employer?.companyName || "Hiring Team";

    const scheduledDate = new Date((interview as any).scheduledAt);
    const formattedDate = scheduledDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = scheduledDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const subject = `Interview Cancellation – ${(interview as any).jobPost?.title || "Position"}`;

    const body = `Dear ${candidateName},

We regret to inform you that we need to cancel the interview that was scheduled for ${formattedDate} at ${formattedTime}.

Cancellation Reason:
${reason}

We sincerely apologize for any inconvenience this may cause. We remain interested in your profile and may reach out in the future with other opportunities that align with your background and experience.

If you have any questions or concerns, please don't hesitate to contact us.

Best regards,
${companyName}`;

    return { subject, body };
  },

  /**
   * Cancel an interview and send cancellation email to the candidate.
   * Changes status SCHEDULED → CANCELLED.
   * Removes Google Calendar event.
   * Sends email with cancellation reason.
   */
  async cancelAndSendEmail(
    id: string,
    employerId: string,
    reason: string,
    emailBody: string
  ): Promise<InterviewDTO> {
    const employerProfileId = await getEmployerProfileId(employerId);
    const existing = await interviewRepository.findById(id, employerProfileId);
    if (!existing) {
      throw buildHttpError("Interview not found", 404);
    }

    // Only cancel SCHEDULED interviews (not DRAFT)
    if ((existing as any).status !== "SCHEDULED") {
      throw buildHttpError(
        "Only scheduled interviews can be cancelled this way",
        400
      );
    }

    // Send cancellation email
    try {
      console.log(
        `[CancelAndSendEmail] Sending cancellation email to ${(existing as any).candidateEmail}`
      );
      
      // Create and send email
      const candidateName = [
        (existing as any).candidate?.user?.firstName,
        (existing as any).candidate?.user?.lastName,
      ]
        .filter(Boolean)
        .join(" ") || "Candidate";

      await sendInterviewEmail({
        candidateName,
        candidateEmail: (existing as any).candidateEmail,
        jobTitle: (existing as any).jobPost?.title || "",
        companyName: (existing as any).employer?.companyName || "",
        senderName: [
          (existing as any).employer?.user?.firstName,
          (existing as any).employer?.user?.lastName,
        ]
          .filter(Boolean)
          .join(" ") || (existing as any).employer?.companyName,
        senderEmail: (existing as any).employer?.user?.email || "",
        scheduledAt: new Date((existing as any).scheduledAt),
        meetingType: (existing as any).meetingType,
        location: (existing as any).location,
        meetingLink: (existing as any).meetingLink,
        additionalInfo: (existing as any).additionalInfo,
        customBody: emailBody,
        isCancellation: true,
        cancellationReason: reason,
      } as any);
    } catch (err) {
      console.error("Failed to send cancellation email:", err);
      throw buildHttpError(
        `Failed to send cancellation email: ${(err as Error).message}`,
        500
      );
    }

    // Remove Google Calendar event
    const googleEventId = (existing as any).googleCalendarEventId;
    if (googleEventId && googleCalendarService.isConfigured()) {
      try {
        await googleCalendarService.deleteEvent(googleEventId);
        console.log(`[CancelAndSendEmail] Google Calendar event deleted: ${googleEventId}`);
      } catch (err) {
        console.error(
          "Failed to delete Google Calendar event:",
          err
        );
        // Don't fail the operation if calendar delete fails
      }
    }

    // Update status to CANCELLED
    const updated = await interviewRepository.update(id, employerProfileId, {
      status: "CANCELLED",
      cancelledAt: new Date(),
      cancellationReason: reason,
    });

    console.log(`[CancelAndSendEmail] Interview cancelled: ${id}`);
    return mapToDTO(updated);
  },
};