"use client";

import { use, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, UserSquare } from "lucide-react";
import JobPostPanel from "@/components/employer/interviews/JobPostPanel";
import ApplicantPanel from "@/components/employer/interviews/ApplicantPanel";
import DateCalendar from "@/components/employer/interviews/DateCalendar";
import ScheduleForm from "@/components/employer/interviews/ScheduleForm";
import GeneratedEmailPreview from "@/components/employer/interviews/GeneratedEmailPreview";
import ReadyToScheduleBar from "@/components/employer/interviews/ReadyToScheduleBar";
import SuccessModal from "@/components/employer/interviews/SuccessModal";
import { MeetingType, InterviewDTO } from "@/types/employer/interview.types";
import { createInterview, scheduleAndSend } from "@/lib/employer/interviews.service";
import { getCandidateById } from "@/lib/employer/candidates.service";
import { getJobPostById } from "@/lib/employer/jobPosts.service";

interface Props {
  params: Promise<{ candidateId: string }>;
}

export default function ScheduleInterviewPage({ params }: Props) {
  const { candidateId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get("postId");

  // Initialize with a future date (7 days from now)
  const [date, setDate] = useState(() => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    return futureDate.toISOString().split("T")[0];
  });
  const [time, setTime] = useState("14:00");
  const [meetingType, setMeetingType] = useState<MeetingType>("ONLINE");
  const [location, setLocation] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledInterview, setScheduledInterview] = useState<InterviewDTO | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // State to store fetched real IDs and data
  const [realCandidateId, setRealCandidateId] = useState<string>("");
  const [realJobPostId, setRealJobPostId] = useState<string>("");
  const [loadingIds, setLoadingIds] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [customEmailBody, setCustomEmailBody] = useState<string | null>(null);
  const [realCandidateData, setRealCandidateData] = useState<{ name: string; email: string } | null>(null);
  const [realJobPostData, setRealJobPostData] = useState<{ title: string; description: string } | null>(null);

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

  // Handle scheduling: create interview and send invitation email
  const handleScheduleInterview = useCallback(async () => {
    setIsScheduling(true);
    setScheduleError(null);
    try {
      // Validate we have the required IDs
      if (!realCandidateId) {
        throw new Error("Candidate not found. Please go back and try again.");
      }
      if (!realJobPostId) {
        throw new Error("Job post not found. Please go back and try again.");
      }

      // Step 1: Create a draft interview with real UUIDs
      const payload = {
        candidateProfileId: realCandidateId,
        jobPostId: realJobPostId,
        scheduledAt: `${date}T${time}:00Z`,
        meetingType,
        location: meetingType === "ONSITE" ? location : undefined,
        additionalInfo: additionalInfo.trim() || undefined,
      };

      console.log("[ScheduleInterview] Creating interview with payload:", payload);

      const draftInterview = await createInterview(payload);

      console.log("[ScheduleInterview] Draft interview created:", draftInterview);

      // Step 2: Schedule and send the interview invitation
      const finalInterview = await scheduleAndSend(draftInterview.id);

      console.log("[ScheduleInterview] Interview scheduled and sent:", finalInterview);

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
  }, [realCandidateId, realJobPostId, date, time, meetingType, location, additionalInfo, router]);

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
              Scheduling for Candidate ID: {candidateId}
            </p>
          </div>
          
          <button 
            onClick={() => {
              if (postId) {
                router.push(`/users/employer/job-posts/${postId}/candidates`);
                return;
              }

              router.back();
            }} 
            className="flex items-center self-end gap-2 px-5 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 sm:self-auto"
          >
            <ChevronLeft size={18} />
            Back To Candidate
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Job Post & Applicant</h2>
            </div>
            <JobPostPanel jobPostId={realJobPostId} />
            <ApplicantPanel candidateId={realCandidateId} />
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Select Interview Date</h2>
            <DateCalendar 
              selectedDate={date} 
              onDateChange={setDate}
            />
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Meeting Details</h2>
            <ScheduleForm 
              date={date}
              setDate={setDate}
              time={time}
              setTime={setTime}
              meetingType={meetingType}
              setMeetingType={setMeetingType}
              location={location}
              setLocation={setLocation}
              additionalInfo={additionalInfo}
              setAdditionalInfo={setAdditionalInfo}
              onGenerateEmail={() => setShowEmailPreview(true)}
            />

            {/* Email Preview Component - shown when Generate Email button is clicked */}
            {showEmailPreview && (
              <EmailPreviewSection 
                candidateName={realCandidateData?.name || "Candidate"}
                candidateEmail={realCandidateData?.email || "candidate@example.com"}
                date={date}
                time={time}
                meetingType={meetingType}
                location={location}
                additionalInfo={additionalInfo}
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
          onSaveDraft={() => {}}
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
          ⏳ Loading candidate and job post information...
        </div>
      )}

      {/* Load Error Alert */}
      {loadError && !loadingIds && (
        <div className="fixed bottom-4 left-4 right-4 z-40 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
          ⚠️ {loadError}
        </div>
      )}

      {/* Schedule Error Alert */}
      {scheduleError && (
        <div className="fixed top-4 left-4 right-4 z-40 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          ⚠️ {scheduleError}
        </div>
      )}

      <SuccessModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setScheduledInterview(null);
        }}
        candidateName={scheduledInterview?.candidate.name}
        candidateEmail={scheduledInterview?.candidateEmail}
        jobTitle={scheduledInterview?.jobPost.title}
        scheduledAt={scheduledInterview?.scheduledAt}
        meetingType={scheduledInterview?.meetingType}
        meetingLink={scheduledInterview?.meetingLink}
        location={scheduledInterview?.location}
      />
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
  location,
  additionalInfo,
  onEmailConfirm,
}: {
  candidateName: string;
  candidateEmail: string;
  date: string;
  time: string;
  meetingType: MeetingType;
  location: string;
  additionalInfo: string;
  onEmailConfirm?: (emailContent: string) => void;
}) {
  return (
    <GeneratedEmailPreview
      candidateName={candidateName}
      candidateEmail={candidateEmail}
      date={date}
      time={time}
      meetingType={meetingType}
      location={location}
      additionalInfo={additionalInfo}
      onConfirm={onEmailConfirm}
    />
  );
}