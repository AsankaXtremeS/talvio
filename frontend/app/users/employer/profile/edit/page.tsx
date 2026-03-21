"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarDays,
  Camera,
  Globe,
  Link2,
  Save,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { FaLinkedinIn, FaFacebookF, FaXTwitter } from "react-icons/fa6";

interface CompanyData {
  name: string;
  initial: string;
  description: string;
  coverImage: string;
  industry: string;
  companyType: string;
  verifiedDate: string;
  companySize: string;
  founded: string;
  location: string;
  specialties: string;
  linkedIn: string;
  facebook: string;
  twitter: string;
  website: string;
}

export default function EditEmployerProfilePage() {
  const router = useRouter();

  const [formData, setFormData] = useState<CompanyData>({
    name: "Rackspace",
    initial: "R",
    description:
      "Rackspace is a global IT services company that specializes in cloud computing and managed IT solutions. The company helps businesses design, build, and manage secure cloud environments across public, private, and hybrid platforms.",
    coverImage: "/images/company/Rackspace.jpg",
    industry: "Software Development",
    companyType: "Private",
    verifiedDate: "2024-06-23",
    companySize: "200-1000",
    founded: "2017",
    location: "San Francisco, CA, USA",
    specialties:
      "Enterprise API Management, Identity & Access Management (IAM), Cloud-Native Integration Platforms, Integration Platform as a Service (iPaaS), Ballerina Language, Choreo, Secure Enterprise Integrations.",
    linkedIn: "https://linkedin.com/company/rackspace",
    facebook: "https://facebook.com/rackspace",
    twitter: "https://twitter.com/rackspace",
    website: "https://rackspace.com",
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    router.push("/users/employer/profile");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    // Navigate back to profile page after successful save
    router.push("/employer/profile");
  };

  const companySizes = [
    "1-10",
    "11-50",
    "51-200",
    "200-1000",
    "1001-5000",
    "5000+",
  ];

  const companyTypes = ["Private", "Public", "Non-profit", "Government"];

  const industries = [
    "Software Development",
    "Information Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Manufacturing",
    "Retail",
    "Consulting",
    "Marketing",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-[#eef5ff] p-4 pb-12">
      <div className="mx-auto max-w-[1120px]">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/users/employer/profile"
            className="flex items-center gap-2 text-sm font-medium text-[#667085] transition hover:text-[#2563eb]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl border border-[#e5e7eb] bg-white px-5 py-2.5 text-sm font-semibold text-[#667085] transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit}>
          <div className="rounded-[28px] border border-[#dbe7ff] bg-white p-6 shadow-sm">
            <div className="mb-6 border-b border-[#e5e7eb] pb-6">
              <h1 className="text-2xl font-bold text-[#111827]">
                Edit Company Profile
              </h1>
              <p className="mt-1 text-sm text-[#667085]">
                Update your company information to attract top talent
              </p>
            </div>

            <div className="flex flex-col gap-8">
              {/* Logo & Cover Image Section */}
              <section className="rounded-3xl border border-[#e5e7eb] p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <h2 className="mb-5 text-xl font-bold text-[#2563eb]">
                  Brand Identity
                </h2>

                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Logo Upload */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#111827]">
                      Company Logo
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {logoPreview ? (
                          <div className="relative h-20 w-20 overflow-hidden rounded-2xl">
                            <Image
                              src={logoPreview}
                              alt="Logo preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#101828] text-2xl font-bold text-white shadow-sm">
                            {formData.initial}
                          </div>
                        )}
                        <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#2563eb] text-white shadow-lg transition hover:bg-[#1d4ed8]">
                          <Camera className="h-4 w-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-[#667085]">
                          Upload a logo for your company. Recommended size:
                          200x200px
                        </p>
                        <p className="mt-1 text-xs text-[#9ca3af]">
                          PNG, JPG or SVG. Max 2MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Company Initial */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#111827]">
                      Company Initial (Fallback)
                    </label>
                    <input
                      type="text"
                      name="initial"
                      value={formData.initial}
                      onChange={handleInputChange}
                      maxLength={2}
                      className="w-20 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-center text-lg font-bold text-[#111827] outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
                    />
                    <p className="mt-2 text-xs text-[#9ca3af]">
                      Displayed when logo is unavailable
                    </p>
                  </div>
                </div>

                {/* Cover Image Upload */}
                <div className="mt-6">
                  <label className="mb-2 block text-sm font-semibold text-[#111827]">
                    Cover Image
                  </label>
                  <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-[#e5e7eb] transition hover:border-[#2563eb]">
                    {coverPreview || formData.coverImage ? (
                      <div className="relative h-[200px] w-full">
                        <Image
                          src={coverPreview || formData.coverImage}
                          alt="Cover preview"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition hover:opacity-100">
                          <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-gray-100">
                            <Upload className="h-4 w-4" />
                            Change
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCoverUpload}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setCoverPreview(null);
                              setFormData((prev) => ({
                                ...prev,
                                coverImage: "",
                              }));
                            }}
                            className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex h-[200px] cursor-pointer flex-col items-center justify-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eef5ff]">
                          <Upload className="h-6 w-6 text-[#2563eb]" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-[#111827]">
                            Click to upload cover image
                          </p>
                          <p className="mt-1 text-xs text-[#9ca3af]">
                            Recommended: 1200x400px, PNG or JPG
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </section>

              {/* Basic Info Section */}
              <section className="rounded-3xl border border-[#e5e7eb] p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <h2 className="mb-5 text-xl font-bold text-[#2563eb]">
                  Basic Information
                </h2>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="lg:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-[#111827]">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[#111827] outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/20"
                      placeholder="Enter your company name"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-[#111827]">
                      Company Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full resize-none rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[#111827] outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/20"
                      placeholder="Describe your company, mission, and what makes you unique..."
                    />
                    <p className="mt-1 text-right text-xs text-[#9ca3af]">
                      {formData.description.length}/500 characters
                    </p>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-[#111827]">
                      Website
                    </label>
                    <div className="relative">
                      <Link2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] py-3 pl-11 pr-4 text-[#111827] outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/20"
                        placeholder="https://yourcompany.com"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Company Details Section */}
              <section className="rounded-3xl border border-[#e5e7eb] p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <h2 className="mb-5 text-xl font-bold text-[#2563eb]">
                  Company Details
                </h2>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#111827]">
                      <Briefcase className="h-4 w-4 text-[#2563eb]" />
                      Industry
                    </label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full appearance-none rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[#111827] outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/20"
                    >
                      {industries.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#111827]">
                      <Building2 className="h-4 w-4 text-[#2563eb]" />
                      Company Type
                    </label>
                    <select
                      name="companyType"
                      value={formData.companyType}
                      onChange={handleInputChange}
                      className="w-full appearance-none rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[#111827] outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/20"
                    >
                      {companyTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#111827]">
                      <Users className="h-4 w-4 text-[#2563eb]" />
                      Company Size
                    </label>
                    <select
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleInputChange}
                      className="w-full appearance-none rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[#111827] outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/20"
                    >
                      {companySizes.map((size) => (
                        <option key={size} value={size}>
                          {size} employees
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#111827]">
                      <CalendarDays className="h-4 w-4 text-[#2563eb]" />
                      Founded Year
                    </label>
                    <input
                      type="number"
                      name="founded"
                      value={formData.founded}
                      onChange={handleInputChange}
                      min="1800"
                      max={new Date().getFullYear()}
                      className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[#111827] outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/20"
                      placeholder="2017"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#111827]">
                      <Globe className="h-4 w-4 text-[#2563eb]" />
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[#111827] outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/20"
                      placeholder="City, State, Country"
                    />
                  </div>
                </div>
              </section>

              {/* Specialties Section */}
              <section className="rounded-3xl border border-[#e5e7eb] p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <h2 className="mb-5 text-xl font-bold text-[#2563eb]">
                  Specialties
                </h2>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#111827]">
                    Areas of Expertise
                  </label>
                  <textarea
                    name="specialties"
                    value={formData.specialties}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[#111827] outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/20"
                    placeholder="Enter your company's specialties, separated by commas..."
                  />
                  <p className="mt-2 text-xs text-[#9ca3af]">
                    Separate each specialty with a comma (e.g., Cloud Computing,
                    AI/ML, Data Analytics)
                  </p>
                </div>

                {/* Preview Tags */}
                {formData.specialties && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-[#667085]">
                      Preview:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.specialties.split(",").map(
                        (specialty, index) =>
                          specialty.trim() && (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 rounded-full bg-[#eef5ff] px-3 py-1.5 text-xs font-medium text-[#2563eb]"
                            >
                              {specialty.trim()}
                            </span>
                          )
                      )}
                    </div>
                  </div>
                )}
              </section>

              {/* Social Links Section */}
              <section className="rounded-3xl border border-[#e5e7eb] p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <h2 className="mb-5 text-xl font-bold text-[#2563eb]">
                  Social Links
                </h2>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#111827]">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-[#0A66C2]">
                        <FaLinkedinIn className="h-3 w-3 text-white" />
                      </div>
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      name="linkedIn"
                      value={formData.linkedIn}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[#111827] outline-none transition focus:border-[#0A66C2] focus:bg-white focus:ring-2 focus:ring-[#0A66C2]/20"
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#111827]">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-[#1877F2]">
                        <FaFacebookF className="h-3 w-3 text-white" />
                      </div>
                      Facebook
                    </label>
                    <input
                      type="url"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[#111827] outline-none transition focus:border-[#1877F2] focus:bg-white focus:ring-2 focus:ring-[#1877F2]/20"
                      placeholder="https://facebook.com/..."
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#111827]">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-[#111827]">
                        <FaXTwitter className="h-3 w-3 text-white" />
                      </div>
                      X (Twitter)
                    </label>
                    <input
                      type="url"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[#111827] outline-none transition focus:border-[#111827] focus:bg-white focus:ring-2 focus:ring-[#111827]/20"
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                </div>

                {/* Social Preview */}
                <div className="mt-6 rounded-2xl bg-[#f9fafb] p-4">
                  <p className="mb-3 text-sm font-medium text-[#667085]">
                    Preview:
                  </p>
                  <div className="flex gap-3">
                    {formData.linkedIn && (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A66C2] text-white shadow-sm">
                        <FaLinkedinIn size={20} />
                      </div>
                    )}
                    {formData.facebook && (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1877F2] text-white shadow-sm">
                        <FaFacebookF size={20} />
                      </div>
                    )}
                    {formData.twitter && (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#111827] text-white shadow-sm">
                        <FaXTwitter size={18} />
                      </div>
                    )}
                    {!formData.linkedIn &&
                      !formData.facebook &&
                      !formData.twitter && (
                        <p className="text-sm text-[#9ca3af]">
                          Add social links to see preview
                        </p>
                      )}
                  </div>
                </div>
              </section>

              {/* Danger Zone */}
              <section className="rounded-3xl border border-red-200 bg-red-50/50 p-6">
                <h2 className="mb-2 text-xl font-bold text-red-600">
                  Danger Zone
                </h2>
                <p className="mb-4 text-sm text-[#667085]">
                  Irreversible and destructive actions
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Deactivate Profile
                  </button>
                </div>
              </section>
            </div>
          </div>

          {/* Bottom Action Bar (Mobile) */}
          <div className="fixed bottom-0 left-0 right-0 border-t border-[#e5e7eb] bg-white p-4 shadow-lg lg:hidden">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-xl border border-[#e5e7eb] bg-white px-5 py-3 text-sm font-semibold text-[#667085] transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#2563eb] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-70"
              >
                {isSaving ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}