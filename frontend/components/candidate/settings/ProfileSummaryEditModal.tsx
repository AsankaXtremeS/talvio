"use client";

import { useState, useRef } from "react";
import { X, User, FileText, Sparkles, Plus, Trash2 } from "lucide-react";
import { profileService } from "@/lib/candidate/profile.service";

interface ProfileSummaryEditModalProps {
  initial: {
    fullName: string;
    location: string;
    email: string;
    phone: string;
    bio: string;
    skills: string[];
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
  };
  onClose: () => void;
  onSave: (data: any) => void;
}

type Section = "personal" | "bio" | "skills";

const sections: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: "personal", label: "Personal info", icon: <User className="w-[15px] h-[15px]" /> },
  { key: "bio", label: "Bio", icon: <FileText className="w-[15px] h-[15px]" /> },
  { key: "skills", label: "Skills", icon: <Sparkles className="w-[15px] h-[15px]" /> },
];

//Reusable Field component 
function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[#374151]">{label}</label>
      <div className={`[&_input]:w-full [&_input]:h-9 [&_input]:rounded-lg [&_input]:border 
      ${error ? "[&_input]:border-red-500 [&_textarea]:border-red-500 focus-within:[&_input]:border-red-500 focus-within:[&_textarea]:border-red-500" : "[&_input]:border-[#E4E8F2] [&_textarea]:border-[#E4E8F2]"} 
      [&_input]:px-3 [&_input]:text-sm [&_input]:text-[#111827] [&_input]:outline-none [&_input]:transition [&_input:focus]:border-blue-400 
      [&_input:focus]:ring-2 [&_input:focus]:ring-blue-50 [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border 
      [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-sm [&_textarea]:text-[#111827] [&_textarea]:outline-none [&_textarea]:transition [&_textarea:focus]:border-blue-400 
      [&_textarea:focus]:ring-2 [&_textarea]:focus:ring-blue-50`}>
        {children}
      </div>
      {error && <span className="text-[11px] font-medium text-red-500">{error}</span>}
    </div>
  );
}

export default function ProfileSummaryEditModal({
  initial,
  onClose,
  onSave,
}: ProfileSummaryEditModalProps) {
  // Guard — if initial is not ready yet, render nothing
  if (!initial) return null;

  //Splitting full name into first and last name 
  const safeName = initial.fullName ?? "";
  const nameParts = safeName.trim().split(" ");

  const [activeSection, setActiveSection] = useState<Section>("personal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    phone?: string;
    githubUrl?: string;
    linkedinUrl?: string;
  }>({});
  const [newSkill, setNewSkill] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  const [firstName, setFirstName] = useState(nameParts[0] ?? "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") ?? "");
  const [email, setEmail] = useState(initial.email ?? "");
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [location, setLocation] = useState(initial.location ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [skills, setSkills] = useState<string[]>(initial.skills ?? []);
  const [linkedinUrl, setLinkedinUrl] = useState(initial.linkedinUrl ?? "");
  const [githubUrl, setGithubUrl] = useState(initial.githubUrl ?? "");
  const [portfolioUrl, setPortfolioUrl] = useState(initial.portfolioUrl ?? "");

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {   //Ensuring the skill is not empty and not already present
      setSkills((prev) => [...prev, trimmed]);    //add to end of array
    }
    setNewSkill("");                         //clearing the input field
  };

  const handleSave = async () => {
    // Validate fields
    const errors: {
      email?: string;
      phone?: string;
      githubUrl?: string;
      linkedinUrl?: string;
    } = {};

    // Generic email validation (RFC 5322 simplified)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation: optional leading '+', digits only, length between 7-15
    const cleanedPhone = phone.replace(/[^\d]/g, '');
    if (phone) {
      const phoneValid = /^\+?\d{7,15}$/.test(phone.replace(/\s+/g, '')) && cleanedPhone.length >= 7 && cleanedPhone.length <= 15;
      if (!phoneValid) {
        errors.phone = "Please enter a valid contact number (7 to 15 digits)";
      }
    }

    const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9\-._~]+\/?$/i;
    if (githubUrl && !githubRegex.test(githubUrl)) {
      errors.githubUrl = "Please enter a valid GitHub URL (e.g. https://github.com/username)";
    }

    const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/[a-zA-Z0-9\-._~%/]+\/?$/i;
    if (linkedinUrl && !linkedinRegex.test(linkedinUrl)) {
      errors.linkedinUrl = "Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/username)";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setActiveSection("personal");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await profileService.updateProfile({      //calls the service to update the profile 
        firstName,
        lastName,
        email,
        location,
        bio,
        skills,
        linkedinUrl,
        githubUrl,
        portfolioUrl,
      });
      onSave({                                            // calls onSave prop to update the parent's local state
        fullName: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName,
        location,
        email,
        phone,
        bio,
        skills,
        linkedinUrl,
        githubUrl,
        portfolioUrl,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    >
      <div className="relative w-full max-w-2xl max-h-[88vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0F0] shrink-0">
          <div>
            <h2 className="text-[15px] font-semibold text-[#111827]">Edit profile</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">Your changes will be saved to your account</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:bg-[#F5F5F5] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar */}
          <nav className="w-40 shrink-0 border-r border-[#F0F0F0] py-3 flex flex-col gap-0.5 px-2">
            {sections.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition w-full text-left ${
                  activeSection === s.key
                    ? "bg-[#EFF6FF] text-blue-700 font-medium"
                    : "text-[#6B7280] hover:bg-[#F5F5F5]"
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </nav>

          {/* Form content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">

            {activeSection === "personal" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First name">
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                    />
                  </Field>
                  <Field label="Last name">
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                    />
                  </Field>
                </div>
                <Field label="Email" error={fieldErrors.email}>
                  <input
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    type="email"
                    placeholder="email@example.com"
                  />
                </Field>
                <Field label="Phone" error={fieldErrors.phone}>
                  <input
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    placeholder="+1 123 456 7890"
                  />
                </Field>
                <Field label="Location">
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Province, Country"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="LinkedIn URL" error={fieldErrors.linkedinUrl}>
                    <input
                      value={linkedinUrl}
                      onChange={(e) => {
                        setLinkedinUrl(e.target.value);
                        if (fieldErrors.linkedinUrl) setFieldErrors((prev) => ({ ...prev, linkedinUrl: undefined }));
                      }}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </Field>
                  <Field label="GitHub URL" error={fieldErrors.githubUrl}>
                    <input
                      value={githubUrl}
                      onChange={(e) => {
                        setGithubUrl(e.target.value);
                        if (fieldErrors.githubUrl) setFieldErrors((prev) => ({ ...prev, githubUrl: undefined }));
                      }}
                      placeholder="https://github.com/username"
                    />
                  </Field>
                </div>
                <Field label="Portfolio URL">
                  <input
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourportfolio.com"
                  />
                </Field>
              </>
            )}

            {activeSection === "bio" && (
              <Field label="Bio / Summary">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={7}
                  placeholder="Write a short summary about yourself..."
                  className="resize-none"
                />
              </Field>
            )}

            {activeSection === "skills" && (
              <>
                <div className="flex gap-2">
                  <input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                    placeholder="Type a skill and press Enter"
                    className="flex-1 h-9 rounded-lg border border-[#E4E8F2] px-3 text-sm text-[#111827] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
                  />
                  <button
                    onClick={handleAddSkill}
                    className="h-9 px-3 rounded-lg bg-blue-700 text-white text-sm flex items-center gap-1.5 hover:bg-blue-800 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
                {skills.length === 0 ? (
                  <p className="text-sm text-[#9CA3AF] text-center py-6">
                    No skills added yet. Type one above to get started.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="flex items-center gap-1.5 bg-[#EFF6FF] text-blue-700 text-sm px-3 py-1.5 rounded-full"
                      >
                        {skill}
                        <button
                          onClick={() => setSkills((prev) => prev.filter((s) => s !== skill))}
                          className="text-blue-400 hover:text-blue-700 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F0F0F0] shrink-0 flex items-center justify-between gap-3">
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <span />
          )}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={onClose}
              className="h-9 px-4 rounded-lg border border-[#E4E8F2] text-sm text-[#374151] hover:bg-[#F5F5F5] transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="h-9 px-5 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 transition disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}