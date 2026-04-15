"use client";

import ContactInfoCard from "@/components/candidate/settings/ContactInfoCard";
import EducationCard from "@/components/candidate/settings/EducationCard";
import ProfileCompletionCard from "@/components/candidate/settings/ProfileCompletionCard";
import ProfileHeader from "@/components/candidate/settings/ProfileHeader";
import ProfileSummaryCard from "@/components/candidate/settings/ProfileSummaryCard";
import ProjectsCard from "@/components/candidate/settings/ProjectsCard";
import QuickActionsCard from "@/components/candidate/settings/QuickActionsCard";
import SettingsTopBar from "@/components/candidate/settings/SettingsTopBar";
import WorkExperienceCard from "@/components/candidate/settings/WorkExperienceCard";
import { CandidateSettingsProfile } from "@/components/candidate/settings/types";
import ResumeCard, { type ResumeUploadResult } from "@/components/candidate/settings/ResumeCard";

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
}

export default function CandidateSettingsView({
  profile,
  profileScore,
  resumeData,
  onResumeUpdate,
  onResumeError,
  onRemoveResume,
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
          />

          <ResumeCard 
            cvUrl={resumeData?.cvUrl}
            cvFileName={resumeData?.cvFileName}
            updatedAt={resumeData?.updatedAt}
            onUploadSuccess={onResumeUpdate}
            onUploadError={onResumeError}
            onRemove={onRemoveResume}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <EducationCard
              degree={profile.education.degree}
              field={profile.education.field}
              period={profile.education.period}
            />
            <ProjectsCard
              company={profile.project.company}
              role={profile.project.role}
              period={profile.project.period}
              bullets={profile.project.bullets}
            />
            <WorkExperienceCard
              company={profile.experience.company}
              role={profile.experience.role}
              period={profile.experience.period}
            />
          </div>
        </div>

        <aside className="space-y-4">
          <ProfileCompletionCard score={profileScore} />
          <QuickActionsCard />
          <ContactInfoCard githubUrl={profile.githubUrl} linkedinUrl={profile.linkedinUrl} />
        </aside>
      </div>
    </div>
  );
}
