"use client";

import { use, useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ChevronLeft, Hourglass, UserSquare, Loader2 } from "lucide-react";
import JobPostPanel from "@/components/employer/interviews/JobPostPanel";
import ApplicantPanel from "@/components/employer/interviews/ApplicantPanel";
import DateCalendar from "@/components/employer/interviews/DateCalendar";
import ScheduleForm from "@/components/employer/interviews/ScheduleForm";
import GeneratedEmailPreview from "@/components/employer/interviews/GeneratedEmailPreview";
import ReadyToScheduleBar from "@/components/employer/interviews/ReadyToScheduleBar";
import SuccessModal from "@/components/employer/interviews/SuccessModal";
import ExistingInterviewsModal from "@/components/employer/interviews/ExistingInterviewsModal";
import { MeetingType, InterviewDTO } from "@/types/employer/interview.types";
import { createInterview, updateInterview, scheduleAndSend, getInterviews, getScheduledDates } from "@/lib/employer/interviews.service";
import { getCandidateById } from "@/lib/employer/candidates.service";
import { getJobPostById } from "@/lib/employer/jobPosts.service";
import { useQueryClient } from "@tanstack/react-query";

import { profileService, EmployerProfileDTO } from "@/lib/employer/profile.service";

interface Props {
  params: Promise<{ candidateId: string }>;
}

export default function ScheduleInterviewPage({ params }: Props) {
  const { candidateId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const postId = searchParams.get("postId");

  const [profile, setProfile] = useState<EmployerProfileDTO | null>(null);
  // need today as default date
  const [date, setDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [time, setTime] = useState("14:00");
  const [meetingType, setMeetingType] = useState<MeetingType>("ONLINE");
  const [onlineOption, setOnlineOption] = useState<"GENERATE" | "CUSTOM">("GENERATE");
  const [customLink, setCustomLink] = useState("");
  const [location, setLocation] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledInterview, setScheduledInterview] = useState<InterviewDTO | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [emailRefreshKey, setEmailRefreshKey] = useState(0);

  // if form fields change require re email generation
  useEffect(() => {
    setIsEmailConfirmed(false);
  }, [date, time, meetingType, onlineOption, customLink, location, additionalInfo]);

  // State to store fetched real IDs and data
  const [realCandidateId, setRealCandidateId] = useState<string>("");
  const [realJobPostId, setRealJobPostId] = useState<string>("");
  const [loadingIds, setLoadingIds] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [customEmailBody, setCustomEmailBody] = useState<string | null>(null);
  const [realCandidateData, setRealCandidateData] = useState<{ name: string; email: string } | null>(null);
  const [realJobPostData, setRealJobPostData] = useState<{ title: string; description: string } | null>(null);
  const [existingInterviews, setExistingInterviews] = useState<InterviewDTO[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [scheduledDates, setScheduledDates] = useState<string[]>([]);
  const [isExistingInterviewsModalOpen, setIsExistingInterviewsModalOpen] = useState(false);

  // Fetch real candidate and job post IDs on mount
  useEffect(() => {
    const fetchIds = async () => {
      try {
        setLoadingIds(true);
        setLoadError(null);
        let candidateIdToUse = "";
        let jobPostIdToUse = "";
        let candidateDataToUse = null;
        let jobPostDataToUse = null;

        // Validate postId is provided
        if (!postId) {
          setLoadError("No job post selected. Please select a job post to continue.");
          setLoadingIds(false);
          return;
        }

        // Fetch candidate to get real UUID and data
        if (candidateId) {
          try {
            const candidate = await getCandidateById(candidateId);
            if (candidate) {
              candidateIdToUse = candidate.id;
              candidateDataToUse = {
                name: candidate.name || "Candidate",
                email: candidate.email || "candidate@example.com",
              };
            } else {
              setLoadError("Candidate not found. Please try again.");
            }
          } catch (err) {
            console.error("[ScheduleInterview] Failed to fetch candidate:", err);
            setLoadError("Failed to load candidate information. Please try again.");
          }
        }

        // Fetch job post to get real UUID and data
        if (postId) {
          try {
            const jobPost = await getJobPostById(postId);
            if (jobPost) {
              jobPostIdToUse = jobPost.id;
              jobPostDataToUse = {
                title: jobPost.title || "Job Post",
                description: jobPost.description || "",
              };
            } else {
              setLoadError("Job post not found. Please try again.");
            }
          } catch (err) {
            console.error("[ScheduleInterview] Failed to fetch job post:", err);
            setLoadError("Failed to load job post information. Please try again.");
          }
        }

        setRealCandidateId(candidateIdToUse);
        setRealJobPostId(jobPostIdToUse);
        setRealCandidateData(candidateDataToUse);
        setRealJobPostData(jobPostDataToUse);
      } finally {
        setLoadingIds(false);
      }
    };

    fetchIds();
  }, [candidateId, postId]);

  // Fetch employer profile to check calendar connection
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setProfile(data);
      } catch (err) {
        console.error("[ScheduleInterview] Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, []);

  // Handle date change: fetch existing interviews immediately to show loading view
  const handleDateChange = useCallback(async (newDate: string) => {
    setDate(newDate);
    if (!newDate) return;

    try {
      setLoadingInterviews(true);
      // Fetch interviews for the newly selected date
      const response = await getInterviews({ date: newDate, status: "SCHEDULED" });
      setExistingInterviews(response.data);

      // If interviews exist, show the modal
      if (response.data.length > 0) {
        setIsExistingInterviewsModalOpen(true);
      }
    } catch (err) {
      console.error("[ScheduleInterview] Failed to fetch existing interviews:", err);
    } finally {
      setLoadingInterviews(false);
    }
  }, []);

  // ── Draft state — InterviewDTO (same name as backend) ──
  const [draft, setDraft] = useState<InterviewDTO | null>(null);
  const draftRef = useRef<InterviewDTO | null>(null);
  draftRef.current = draft;

  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [backendEmailBody, setBackendEmailBody] = useState<string | null>(null);

  // Fetch scheduled dates for the month (keep this for the calendar dots)
  const handleMonthChange = useCallback(async (year: number, month: number) => {
    try {
      const dates = await getScheduledDates(year, month);
      setScheduledDates(dates);
    } catch (err) {
      console.error("[ScheduleInterview] Failed to fetch scheduled dates:", err);
    }
  }, []);

  // ── Build ISO scheduledAt from separate date + time fields ──
  function buildScheduledAt(d: string, t: string): string {
    const localDateTime = new Date(`${d}T${t}:00`);
    return localDateTime.toISOString();
  }

  // ── Generate email preview ──────────────────────────────────────────────────
  const handleGenerateEmail = useCallback(async () => {
    if (!date || !time) { setScheduleError("Please select a date and time first."); return; }
    if (meetingType === "ONSITE" && !location.trim()) {
      setScheduleError("Please enter a location for on-site interview.");
      return;
    }
    if (meetingType === "ONLINE" && onlineOption === "CUSTOM" && !customLink.trim()) {
      setScheduleError("Please enter a meeting link for custom online interview.");
      return;
    }

    setScheduleError(null);
    setIsGeneratingEmail(true);

    try {
      if (meetingType === "ONLINE" && onlineOption === "GENERATE" && !profile?.googleCalendarConnected) {
        setScheduleError("Google Calendar is not connected. Please connect your calendar in Profile Settings to generate Google Meet links.");
        return;
      }

      const scheduledAt = buildScheduledAt(date, time);

      // Create or update draft to get meetingLink (for ONLINE Meet link)
      let currentDraft = draftRef.current;

      if (!currentDraft) {
        // New schedule: create draft
        currentDraft = await createInterview({
          jobPostId: realJobPostId,
          candidateProfileId: realCandidateId,
          scheduledAt,
          meetingType,
          meetingLink: meetingType === "ONLINE" && onlineOption === "CUSTOM" ? customLink : undefined,
          location: meetingType === "ONSITE" ? location : undefined,
          additionalInfo: additionalInfo.trim() || undefined,
        });
        setDraft(currentDraft);
      } else {
        // Update existing draft if needed
        currentDraft = await updateInterview(currentDraft.id, {
          scheduledAt,
          meetingType,
          meetingLink: meetingType === "ONLINE" && onlineOption === "CUSTOM" ? customLink : undefined,
          location: meetingType === "ONSITE" ? location : undefined,
          additionalInfo: additionalInfo.trim() || undefined,
        });
        setDraft(currentDraft);
      }
      
      setShowEmailPreview(true);
      setEmailRefreshKey(prev => prev + 1);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to generate email preview.";
      setScheduleError(errorMsg);
    } finally {
      setIsGeneratingEmail(false);
    }
  }, [date, time, meetingType, onlineOption, customLink, location, additionalInfo, realJobPostId, realCandidateId]);

  // Handle scheduling: create interview and send invitation email
  const handleScheduleInterview = useCallback(async () => {
    setIsScheduling(true);
    setScheduleError(null);
    try {
      if (meetingType === "ONLINE" && onlineOption === "GENERATE" && !profile?.googleCalendarConnected) {
        setScheduleError("Google Calendar is not connected. Please connect your calendar in Profile Settings to generate Google Meet links.");
        setIsScheduling(false);
        return;
      }
      
      let currentDraft = draftRef.current;
      
      if (!currentDraft) {
        // Fallback if they didn't generate email first (shouldn't happen with UI guards)
        const scheduledAt = buildScheduledAt(date, time);
        currentDraft = await createInterview({
          candidateProfileId: realCandidateId,
          jobPostId: realJobPostId,
          scheduledAt,
          meetingType,
          meetingLink: meetingType === "ONLINE" && onlineOption === "CUSTOM" ? customLink : undefined,
          location: meetingType === "ONSITE" ? location : undefined,
          additionalInfo: additionalInfo.trim() || undefined,
        });
      }

      // Step 2: Schedule and send the interview invitation
      const finalInterview = await scheduleAndSend(currentDraft.id);

      console.log("[ScheduleInterview] Interview scheduled and sent:", finalInterview);

      // Invalidate React Query cache to ensure automatic update on dashboard
      queryClient.invalidateQueries({ queryKey: ["employer-interviews"] });

      // Step 3: Store the interview and show success modal
      setScheduledInterview(finalInterview);
      setIsModalOpen(true);

      // Step 4: Auto-navigate to interviews page after 3 seconds
      setTimeout(() => {
        router.push("/users/employer/interviews");
      }, 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to schedule interview";
      setScheduleError(errorMsg);
      console.error("[ScheduleInterview] Schedule error:", err);
    } finally {
      setIsScheduling(false);
    }
  }, [realCandidateId, realJobPostId, date, time, meetingType, onlineOption, customLink, location, additionalInfo, router]);

  return (
    <div className="flex-1 min-h-screen bg-[#F7F9FC] p-0 font-sans">
      <div className="max-w-6xl px-4 py-8 mx-auto pt-2">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 text-indigo-700 rounded-lg bg-indigo-50">
                <UserSquare size={28} />
              </div>
              <h1 className="text-3xl font-bold text-indigo-500">Schedule Interview</h1>
            </div>
            <p className="ml-12 text-base text-gray-600">
              Scheduling for the Candidate
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="flex items-center self-end gap-2 px-5 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 sm:self-auto"
          >
            <ChevronLeft size={18} />
            Go Back
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2 min-h-[380px]">
          <div className="space-y-4 flex flex-col h-full min-h-full">
            <div>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Job Post & Applicant</h2>
            </div>
            <JobPostPanel jobPostId={realJobPostId} />
            <ApplicantPanel candidateId={realCandidateId} jobPostId={realJobPostId} />
          </div>

          <div className="flex flex-col h-full min-h-full justify-stretch">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Select Interview Date</h2>
            <DateCalendar
              selectedDate={date}
              onDateChange={handleDateChange}
              scheduledDates={scheduledDates}
              onMonthChange={handleMonthChange}
            />
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Meeting Details</h2>

            {meetingType === "ONLINE" && onlineOption === "GENERATE" && profile && !profile.googleCalendarConnected && (
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 animate-in slide-in-from-top-2 duration-300">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-bold">Google Calendar Not Connected</p>
                  <p className="mt-1 leading-relaxed text-yellow-700">
                    You have not connected your Google Calendar yet. To automatically generate real Google Meet links, please connect your account in your profile settings.
                  </p>
                  <button 
                    onClick={() => router.push("/users/employer/profile")}
                    className="mt-2 text-indigo-600 font-semibold hover:underline"
                  >
                    Go to Profile Settings →
                  </button>
                </div>
              </div>
            )}

            <ScheduleForm
              date={date}
              setDate={setDate}
              time={time}
              setTime={setTime}
              meetingType={meetingType}
              setMeetingType={setMeetingType}
              onlineOption={onlineOption}
              setOnlineOption={setOnlineOption}
              customLink={customLink}
              setCustomLink={setCustomLink}
              location={location}
              setLocation={setLocation}
              additionalInfo={additionalInfo}
              setAdditionalInfo={setAdditionalInfo}
              onGenerateEmail={handleGenerateEmail}
              isGeneratingEmail={isGeneratingEmail}
            />

            {/* Email Preview Component - shown when Generate Email button is clicked */}
            {showEmailPreview && (
              <EmailPreviewSection
                candidateName={realCandidateData?.name || "Candidate"}
                candidateEmail={realCandidateData?.email || "candidate@example.com"}
                date={date}
                time={time}
                meetingType={meetingType}
                meetingLink={meetingType === "ONLINE" && onlineOption === "CUSTOM" ? customLink : undefined}
                location={location}
                additionalInfo={additionalInfo}
                refreshKey={emailRefreshKey}
                onEmailConfirm={(emailContent) => {
                  setCustomEmailBody(emailContent);
                  setIsEmailConfirmed(true);
                }}
              />
            )}
          </div>
        </div>

        <ReadyToScheduleBar
          date={date}
          time={time}
          meetingType={meetingType}
          location={location}
          meetingLink={meetingType === "ONLINE" && onlineOption === "CUSTOM" ? customLink : draft?.meetingLink}
          candidateEmail={realCandidateData?.email}
          onRemove={() => router.back()}
          onSchedule={handleScheduleInterview}
          hasEmailPreview={isEmailConfirmed}
          isScheduling={isScheduling}
          isDisabled={loadingIds}
        />
      </div>

      {/* Loading IDs Alert */}
      {loadingIds && (
        <div className="fixed bottom-4 left-4 right-4 z-40 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
          <Hourglass size={20} /> Loading candidate and job post information...
        </div>
      )}

      {/* Load Error Alert */}
      {loadError && !loadingIds && (
        <div className="fixed bottom-4 left-4 right-4 z-40 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
          <AlertTriangle size={20} /> {loadError}
        </div>
      )}

      {/* Schedule Error Alert */}
      {scheduleError && (
        <div className="fixed top-4 left-4 right-4 z-40 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertTriangle size={20} /> {scheduleError}
        </div>
      )}
      <SuccessModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setScheduledInterview(null);
        }}
        candidateName={scheduledInterview?.candidate?.name || realCandidateData?.name || "Candidate"}
        candidateEmail={scheduledInterview?.candidateEmail || realCandidateData?.email || ""}
        jobTitle={scheduledInterview?.jobPost?.title || realJobPostData?.title || ""}
        scheduledAt={scheduledInterview?.scheduledAt}
        meetingType={scheduledInterview?.meetingType}
        meetingLink={scheduledInterview?.meetingLink}
        location={scheduledInterview?.location}
        emailSentAt={scheduledInterview?.emailSentAt}
      />

      <ExistingInterviewsModal
        isOpen={isExistingInterviewsModalOpen}
        onClose={() => setIsExistingInterviewsModalOpen(false)}
        date={date}
        interviews={existingInterviews}
      />

      {/* Loading Overlay for fetching interviews */}
      {loadingInterviews && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold text-gray-700">Checking schedule...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Email Preview Section Component
function EmailPreviewSection({
  candidateName,
  candidateEmail,
  date,
  time,
  meetingType,
  meetingLink,
  location,
  additionalInfo,
  refreshKey,
  onEmailConfirm,
}: {
  candidateName: string;
  candidateEmail: string;
  date: string;
  time: string;
  meetingType: MeetingType;
  meetingLink?: string;
  location: string;
  additionalInfo: string;
  refreshKey?: number;
  onEmailConfirm?: (emailContent: string) => void;
}) {
  return (
    <GeneratedEmailPreview
      candidateName={candidateName}
      candidateEmail={candidateEmail}
      date={date}
      time={time}
      meetingType={meetingType}
      meetingLink={meetingLink}
      location={location}
      additionalInfo={additionalInfo}
      refreshKey={refreshKey}
      onConfirm={onEmailConfirm}
    />
  );
}