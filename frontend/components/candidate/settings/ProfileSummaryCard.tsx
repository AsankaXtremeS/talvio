"use client";

import { Mail, MapPin, MoreHorizontal, Phone, SquarePen, Camera } from "lucide-react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const ProfileSummaryEditModal = dynamic(() => import("./ProfileSummaryEditModal"), { ssr: false });
const ProfilePictureUpdateModal = dynamic(() => import("./ProfilePictureUpdateModal"), { ssr: false });

interface ProfileSummaryCardProps {
  fullName: string;
  location: string;
  email: string;
  phone: string;
  bio: string;
  skills: string[];
  profilePictureUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  onProfileUpdate?: (data: any) => void;
}

export default function ProfileSummaryCard({
  fullName,
  location,
  email,
  phone,
  bio,
  skills,
  profilePictureUrl,
  linkedinUrl,
  githubUrl,
  portfolioUrl,
  onProfileUpdate,
}: ProfileSummaryCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [picModalOpen, setPicModalOpen] = useState(false);
  const [profile, setProfile] = useState({ 
    fullName, 
    location, 
    email, 
    phone, 
    bio, 
    skills, 
    profilePictureUrl,
    linkedinUrl,
    githubUrl,
    portfolioUrl 
  });
  const [showAllSkills, setShowAllSkills] = useState(false);

  // Sync internal state with props when they change (e.g., after initial fetch)
  useEffect(() => {
    setProfile({ 
      fullName, 
      location, 
      email, 
      phone, 
      bio, 
      skills, 
      profilePictureUrl,
      linkedinUrl,
      githubUrl,
      portfolioUrl 
    });
  }, [fullName, location, email, phone, bio, skills, profilePictureUrl, linkedinUrl, githubUrl, portfolioUrl]);

  const initials = fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <section className="rounded-3xl border border-[#E4E8F2] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#A5B4FC] to-[#60A5FA] text-2xl font-bold text-white border-2 border-white shadow-sm">
                {profile.profilePictureUrl ? (
                  <img 
                    src={profile.profilePictureUrl} 
                    alt={profile.fullName} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <button 
                onClick={() => setPicModalOpen(true)}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-[#E4E8F2] text-[#4F46E5] shadow-sm hover:bg-[#F9FAFF] transition-all opacity-0 group-hover:opacity-100 md:opacity-100"
                title="Change Photo"
              >
                <Camera size={14} />
              </button>
            </div>

            <button
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#4F46E5] px-3.5 text-xs font-semibold text-[#4F46E5] hover:bg-[#EEF2FF]"
              onClick={() => setEditOpen(true)}
            >
              <SquarePen size={14} />
              Edit Profile
            </button>
          </div>

          <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D8DFF2] text-[#6B7280] hover:bg-[#F8FAFF]">
            <MoreHorizontal size={15} />
          </button>
        </div>

        <div className="mt-5 space-y-2 border-y border-[#E5E7EB] py-4 text-[#4B5563]">
          <p className="flex items-center gap-2 text-xs md:text-sm">
            <MapPin size={14} className="text-[#6B7280]" />
            {profile.location}
          </p>
          <p className="flex items-center gap-2 text-xs md:text-sm">
            <Mail size={14} className="text-[#6B7280]" />
            {profile.email}
          </p>
          <p className="flex items-center gap-2 text-xs md:text-sm">
            <Phone size={14} className="text-[#6B7280]" />
            {profile.phone}
          </p>
        </div>

        <p className="mt-4 text-xs text-[#374151] md:text-sm">{profile.bio}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(showAllSkills ? profile.skills : profile.skills.slice(0, 5)).map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-[#DBEAFE] px-2.5 py-1 text-[11px] font-semibold text-[#1D4ED8]"
            >
              {skill}
            </span>
          ))}
          {profile.skills.length > 5 && (
            <button
              className="rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[11px] font-semibold text-[#4F46E5]"
              onClick={() => setShowAllSkills((v) => !v)}
            >
              {showAllSkills ? "Show less" : "More"}
            </button>
          )}
        </div>
      </section>
      {editOpen && (
        <ProfileSummaryEditModal
          initial={profile}
          onClose={() => setEditOpen(false)}
          onSave={data => {
            setProfile(prev => ({ ...prev, ...data }));
            if (onProfileUpdate) onProfileUpdate(data);
          }}
        />
      )}
      {picModalOpen && (
        <ProfilePictureUpdateModal
          onClose={() => setPicModalOpen(false)}
          onSave={url => {
            setProfile(prev => ({ ...prev, profilePictureUrl: url }));
            if (onProfileUpdate) onProfileUpdate({ profilePictureUrl: url });
          }}
        />
      )}
    </>
  );
}
