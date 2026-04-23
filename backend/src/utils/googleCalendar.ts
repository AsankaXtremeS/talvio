// Google Calendar API utility.
// Creates calendar events with optional Google Meet link generation.
// Uses a Service Account for server-side auth — no user OAuth redirect needed.
//
// SETUP REQUIRED (in .env):
//   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@project.iam.gserviceaccount.com
//   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
//   GOOGLE_CALENDAR_ID=your_calendar@gmail.com  (the employer's calendar)
//
// NOTE: The Service Account must be granted access to the calendar.
// In Google Calendar → Settings → Share → add service account email with
// "Make changes to events" permission.

import { google } from "googleapis";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CalendarEventInput {
  title: string;              // Event title e.g. "Interview – John Doe | UX Designer"
  description: string;        // HTML or plain text body
  startTime: Date;            // UTC datetime
  durationMinutes?: number;   // Default 60 minutes
  location?: string;          // For ONSITE; omit for ONLINE
  attendeeEmails: string[];   // Candidate + employer emails
  generateMeetLink: boolean;  // true = add Google Meet conferencing
}

export interface CalendarEventResult {
  eventId: string;
  calendarLink: string;       // Link to view event in Google Calendar
  meetLink?: string;          // Only present when generateMeetLink=true
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Build a Google Auth client using Service Account credentials from env.
 * Scopes are limited to calendar — never request broader permissions.
 */
function buildGoogleAuth() {
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

  if (!privateKey || !clientEmail) {
    throw new Error(
      "Google Calendar service account credentials missing. " +
      "Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY in .env"
    );
  }

  // Replace escaped newlines in the private key (common issue with .env files)
  const normalizedKey = privateKey.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: normalizedKey,
    scopes: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
  });

  return auth;
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export const googleCalendarService = {
  /**
   * Create a Google Calendar event.
   * If generateMeetLink is true, Google Meet conferencing is automatically added.
   * Returns the event ID, calendar link, and optionally the Meet link.
   *
   * @throws Error if Google credentials are missing or API call fails.
   */
  async createEvent(input: CalendarEventInput): Promise<CalendarEventResult> {
    const auth = buildGoogleAuth();
    const calendar = google.calendar({ version: "v3", auth });

    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    if (!calendarId) {
      throw new Error("GOOGLE_CALENDAR_ID is not set in environment variables");
    }

    // Calculate end time from duration (default 60 minutes)
    const durationMs = (input.durationMinutes ?? 60) * 60 * 1000;
    const endTime = new Date(input.startTime.getTime() + durationMs);

    // Build the event body
    const eventBody: any = {
      summary: input.title,
      description: input.description,
      start: {
        dateTime: input.startTime.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: "UTC",
      },
      // Removed attendees to avoid Domain-Wide Delegation requirement.
      // We send our own invitation emails via the app's email service.
      guestsCanModifyEvent: false,
      guestsCanInviteOthers: false,
      guestsCanSeeOtherGuests: false,
    };

    // Add location for ONSITE meetings
    if (input.location) {
      eventBody.location = input.location;
    }

    // Add Google Meet conferencing for ONLINE meetings
    if (input.generateMeetLink) {
      eventBody.conferenceData = {
        createRequest: {
          requestId: Math.random().toString(36).substring(2) + Date.now().toString(36),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      };
    }

    const response = await calendar.events.insert({
      calendarId,
      // conferenceDataVersion=1 is required to trigger Meet link creation
      conferenceDataVersion: input.generateMeetLink ? 1 : 0,
      sendUpdates: "none",
      requestBody: eventBody,
    });

    let event = response.data;

    if (!event.id) {
      throw new Error("Google Calendar did not return an event ID");
    }

    // RETRY LOGIC: Sometimes Meet links take a moment to generate
    if (input.generateMeetLink && !event.conferenceData?.entryPoints) {
      console.log("[Google Calendar] Meet link not ready, retrying in 1.5s...");
      await new Promise(resolve => setTimeout(resolve, 1500));
      const refetched = await calendar.events.get({
        calendarId,
        eventId: event.id as string,
      });
      event = refetched.data;
    }

    // Extract Meet link from conference data
    const meetLink =
      event.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === "video")?.uri ??
      undefined;

    // Build the direct link to view the event in Google Calendar
    const calendarLink =
      event.htmlLink ??
      `https://calendar.google.com/calendar/event?eid=${Buffer.from(event.id as string).toString("base64")}`;

    return {
      eventId: event.id as string,
      calendarLink,
      meetLink,
    };
  },

  /**
   * Delete a calendar event (used when interview is cancelled).
   * Silently succeeds if the event no longer exists.
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      const auth = buildGoogleAuth();
      const calendar = google.calendar({ version: "v3", auth });

      const calendarId = process.env.GOOGLE_CALENDAR_ID;
      if (!calendarId) return;

      await calendar.events.delete({
        calendarId,
        eventId,
        sendUpdates: "all",   // Notify attendees of cancellation
      });
    } catch (err: any) {
      // 404 = event already gone — not an error from our perspective
      if (err?.code !== 404 && err?.status !== 404) {
        throw err;
      }
    }
  },

  /**
   * Update an existing calendar event (used when interview is rescheduled).
   */
  async updateEventTime(eventId: string, newStartTime: Date, durationMinutes = 60): Promise<void> {
    const auth = buildGoogleAuth();
    const calendar = google.calendar({ version: "v3", auth });

    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    if (!calendarId) {
      throw new Error("GOOGLE_CALENDAR_ID is not set in environment variables");
    }

    const endTime = new Date(newStartTime.getTime() + durationMinutes * 60 * 1000);

    await calendar.events.patch({
      calendarId,
      eventId,
      sendUpdates: "all",
      requestBody: {
        start: { dateTime: newStartTime.toISOString(), timeZone: "UTC" },
        end: { dateTime: endTime.toISOString(), timeZone: "UTC" },
      },
    });
  },

  /**
   * Check if Google Calendar is configured.
   * Use this to gracefully degrade if credentials aren't set up yet.
   */
  isConfigured(): boolean {
    return !!(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
      process.env.GOOGLE_CALENDAR_ID
    );
  },
};