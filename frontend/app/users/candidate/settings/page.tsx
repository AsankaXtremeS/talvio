"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import RoleGate from "@/components/auth/RoleGate";
import { profileService } from "@/lib/candidate/profile.service";
import {
  CandidateSettingsProfile,
  CandidateSettingsView,
} from "@/components/candidate/settings";
import { useAuth } from "@/context/AuthContext";
import Popup from "@/components/admin/layout/Popup";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Loader2 } from "lucide-react";

export default function CandidateSettingsPage() {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [isResumeProcessing, setIsResumeProcessing] = useState(false);

  const [popup, setPopup] = useState<{ open: boolean; message: string; success?: boolean }>({
    open: false,
    message: "",
    success: false,
  });
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Fetch profile using React Query
  const { data: realProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["candidate-profile", user?.id],
    queryFn: () => profileService.getProfile(),
    enabled: !!user?.id,
    staleTime: 60000,
  });

  const handleResumeUpdate = async (res: any) => {
    if (res && res[0]) {
      try {
        setIsResumeProcessing(true);
        const file = res[0];
        await profileService.updateResume(file.ufsUrl || file.url, file.name);
        
        // Invalidate queries to refresh data
        await queryClient.invalidateQueries({ queryKey: ["candidate-recommendations", user?.id] });
        await queryClient.invalidateQueries({ queryKey: ["candidate-profile", user?.id] });
        await queryClient.invalidateQueries({ queryKey: ["candidate-stats", user?.id] });

        setPopup({ open: true, message: "Resume updated and skills extracted successfully!", success: true });
      } catch (error: any) {
        console.error("Failed to update resume:", error);
        setPopup({ open: true, message: error.message || "Failed to save resume profile.", success: false });
      } finally {
        setIsResumeProcessing(false);
      }
    }
  };

  const handleResumeError = (error: string) => {
    setPopup({ open: true, message: error, success: false });
  };

  const handleRemoveResume = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmRemove = async () => {
    setIsConfirmOpen(false);
    try {
      setIsResumeProcessing(true);
      await profileService.removeResume();

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["candidate-recommendations", user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["candidate-profile", user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["candidate-stats", user?.id] });

      setPopup({ open: true, message: "Resume removed successfully.", success: true });
    } catch (error: any) {
      console.error("Failed to remove resume:", error);
      setPopup({ open: true, message: error.message || "Failed to remove resume.", success: false });
    } finally {
      setIsResumeProcessing(false);
    }
  };

  const handleProfileSaved = (data: any) => {
    queryClient.invalidateQueries({ queryKey: ["candidate-profile", user?.id] });
    
    // Update AuthContext user state so sidebar reflects changes immediately
    if (user) {
      setUser({
        ...user,
        firstName: data.firstName !== undefined ? data.firstName : user.firstName,
        lastName: data.lastName !== undefined ? data.lastName : user.lastName,
        candidateProfile: data.profilePictureUrl !== undefined ? {
          ...(user.candidateProfile || {}),
          profilePictureUrl: data.profilePictureUrl
        } : user.candidateProfile
      });
    }
    
    setPopup({ open: true, message: "Profile updated successfully!", success: true });
  };

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  const displayName = fullName || "John Doe";

  const profile = useMemo<CandidateSettingsProfile>(() => {
    return {
      fullName: displayName,
      title: realProfile?.headline || (user?.role === "PROFESSIONAL" ? "Frontend Engineer" : "Frontend Developer"),
      location: realProfile?.location || "Ottawa, ON, Canada",
      email: user?.email || "example@example.com",
      phone: "+1123-456-7890",
      bio: realProfile?.bio || "A motivated web developer with 2 years of experience in React and Next.js.",
      skills: realProfile?.skills?.length ? realProfile.skills : ["JavaScript", "React", "Next.js", "HTML/CSS", "SQL"],
      profilePictureUrl: realProfile?.profilePictureUrl || undefined,
      linkedinUrl: realProfile?.linkedinUrl || undefined,
      githubUrl: realProfile?.githubUrl || undefined,
      portfolioUrl: realProfile?.portfolioUrl || undefined,
      education: {
        degree: "Bachelor's of Science",
        field: "Computer Science",
        period: "2018-2022",
      },
      project: {
        company: "Shopify",
        role: "Frontend Developer",
        period: "Jun 2022-Present",
        bullets: [
          "Developed modern responsive web applications using React, Next.js, TypeScript, and Tailwind CSS.",
          "Collaborated cross-functionally with designers and backend developers to optimize performance.",
        ],
      },
      experience: {
        company: "Shopify",
        role: "Frontend Developer",
        period: "Jun 2022-Present",
      },
    };
  }, [displayName, user?.email, user?.role, realProfile]);

  if (isProfileLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#4F46E5]" />
      </div>
    );
  }

  return (
    <RoleGate allowedRoles={["STUDENT", "PROFESSIONAL"]}>
      <CandidateSettingsView
        profile={profile}
        profileScore={realProfile?.cvUrl ? 85 : 75}
        resumeData={realProfile ? {
          cvUrl: realProfile.cvUrl,
          cvFileName: realProfile.cvFileName,
          updatedAt: realProfile.updatedAt,
        } : undefined}
        onResumeUpdate={handleResumeUpdate}
        onResumeError={handleResumeError}
        onRemoveResume={handleRemoveResume}
        onProfileSaved={handleProfileSaved}
        userRole={user?.role}
        isResumeProcessing={isResumeProcessing}
      />

      <Popup
        open={popup.open}
        message={popup.message}
        success={popup.success}
        onClose={() => setPopup((prev) => ({ ...prev, open: false }))}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Remove Resume?"
        message="Are you sure you want to remove your default resume? This will clear your extracted skills and affect your job recommendations."
        confirmLabel="Remove Resume"
        cancelLabel="Keep it"
        variant="danger"
        onConfirm={handleConfirmRemove}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </RoleGate>
  );
}