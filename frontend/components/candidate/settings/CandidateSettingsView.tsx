"use client";

import ContactInfoCard from "@/components/candidate/settings/ContactInfoCard";
import ProfileHeader from "@/components/candidate/settings/ProfileHeader";
import ProfileSummaryCard from "@/components/candidate/settings/ProfileSummaryCard";
import SettingsTopBar from "@/components/candidate/settings/SettingsTopBar";
import ResumeCard from "@/components/candidate/settings/ResumeCard";
import UpgradeToProfessionalCard from "@/components/candidate/settings/UpgradeToProfessionalCard";
import type { CandidateSettingsProfile } from "@/components/candidate/settings/types";

interface ResumeData {
  cvUrl?: string;
  cvFileName?: string;
  updatedAt?: string;
}

interface CandidateSettingsViewProps {
  profile: CandidateSettingsProfile;
  profileScore: number;
  resumeData?: ResumeData;
  onResumeUpdate: (res: ResumeUploadResult) => void;
  onResumeError: (error: string) => void;
  onRemoveResume: () => void;
  onProfileSaved: (data: any) => void;
  userRole?: string;
}

export default function CandidateSettingsView({
  profile,
  profileScore,
  resumeData,
  onResumeUpdate,
  onResumeError,
  onRemoveResume,
  onProfileSaved,
  userRole,
}: CandidateSettingsViewProps) {
  return (
    <div className="space-y-4 rounded-3xl bg-[#F4F6FB] p-4 md:p-5">
      <SettingsTopBar />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <ProfileHeader fullName={profile.fullName} title={profile.title} />

          <ProfileSummaryCard
            fullName={profile.fullName}
            location={profile.location}
            email={profile.email}
            phone={profile.phone}
            bio={profile.bio}
            skills={profile.skills}
            onProfileUpdate={onProfileSaved}
          />

          <ResumeCard
            cvUrl={resumeData?.cvUrl}
            cvFileName={resumeData?.cvFileName}
            updatedAt={resumeData?.updatedAt}
            onUploadSuccess={onResumeUpdate}
            onUploadError={onResumeError}
            onRemove={onRemoveResume}
          />
        </div>

        <aside className="space-y-4">
          {userRole === "STUDENT" && <UpgradeToProfessionalCard />}
          <ContactInfoCard githubUrl={profile.githubUrl} linkedinUrl={profile.linkedinUrl} />
        </aside>
      </div>
    </div>
  );
}