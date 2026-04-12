"use client";

import { useEffect, useState } from "react";
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
import { profileService, UpdateProfilePayload } from "@/lib/employer/profile.service";
import { useUploadThing } from "@/lib/uploadthing";
import { useAuth } from "@/context/AuthContext";

interface FormData {
  name: string;
  description: string;
  website: string;
  location: string;
  logoUrl: string;
  coverImageUrl: string;
  industry: string;
  companyType: string;
  companySize: string;
  foundedYear: string;
  specialties: string;
  linkedIn: string;
  facebook: string;
  twitter: string;
}

const EMPTY: FormData = {
  name: "", description: "", website: "", location: "",
  logoUrl: "", coverImageUrl: "", industry: "", companyType: "",
  companySize: "", foundedYear: "", specialties: "",
  linkedIn: "", facebook: "", twitter: "",
};

const COMPANY_SIZES  = ["1-10","11-50","51-200","200-1000","1001-5000","5000+"];
const COMPANY_TYPES  = ["Private","Public","Non-profit","Government"];
const INDUSTRIES     = [
  "Software Development","Information Technology","Finance","Healthcare",
  "Education","Manufacturing","Retail","Consulting","Marketing","Other",
];

export default function EditEmployerProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [form, setForm]               = useState<FormData>(EMPTY);
  const [isLoading, setIsLoading]     = useState(true);
  const [isSaving, setIsSaving]       = useState(false);
  const [isUploadingLogo, setIsUploadingLogo]   = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState<string | null>(null);

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    profileService.getProfile()
      .then((p) => {
        if (cancelled) return;
        setForm({
          name:          p.companyName ?? "",
          description:   p.companyDescription ?? "",
          website:       p.companyWebsite ?? "",
          location:      p.companyLocation ?? "",
          logoUrl:       p.companyLogoUrl ?? "",
          coverImageUrl: p.coverImageUrl ?? "",
          industry:      p.industry ?? "",
          companyType:   p.companyType ?? "",
          companySize:   p.companySize ?? "",
          foundedYear:   p.foundedYear != null ? String(p.foundedYear) : "",
          specialties:   p.specialties ?? "",
          linkedIn:      p.linkedInUrl ?? "",
          facebook:      p.facebookUrl ?? "",
          twitter:       p.twitterUrl ?? "",
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load profile.");
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // ── UploadThing ─────────────────────────────────────────────────────────────
  const { startUpload: uploadLogo } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.url ?? res?.[0]?.ufsUrl;
      if (url) setForm((p) => ({ ...p, logoUrl: url }));
      setIsUploadingLogo(false);
    },
    onUploadError: (error) => {
      setError(error?.message ? `Logo upload failed: ${error.message}` : "Logo upload failed.");
      setIsUploadingLogo(false);
    },
  });

  const { startUpload: uploadCover } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.url ?? res?.[0]?.ufsUrl;
      if (url) setForm((p) => ({ ...p, coverImageUrl: url }));
      setIsUploadingCover(false);
    },
    onUploadError: (error) => {
      setError(error?.message ? `Cover upload failed: ${error.message}` : "Cover upload failed.");
      setIsUploadingCover(false);
    },
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true); setError(null);
    await uploadLogo([file]);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true); setError(null);
    await uploadCover([file]);
  };

  // ── Field change ────────────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true); setError(null); setSuccess(null);

    const payload: UpdateProfilePayload = {
      companyName:        form.name.trim() || undefined,
      companyDescription: form.description,
      companyWebsite:     form.website,
      companyLocation:    form.location,
      companyLogoUrl:     form.logoUrl,
      coverImageUrl:      form.coverImageUrl,
      industry:           form.industry,
      companyType:        form.companyType,
      companySize:        form.companySize,
      foundedYear:        form.foundedYear ? parseInt(form.foundedYear, 10) : null,
      specialties:        form.specialties,
      linkedInUrl:        form.linkedIn,
      facebookUrl:        form.facebook,
      twitterUrl:         form.twitter,
    };

    try {
      const updatedProfile = await profileService.updateProfile(payload);
      setSuccess("Profile updated successfully.");

      if (user) {
        setUser({
          ...user,
          employerProfile: {
            companyName: updatedProfile.companyName,
            verificationStatus: updatedProfile.verificationStatus,
            rejectionReason: updatedProfile.rejectionReason ?? null,
            companyLogoUrl: updatedProfile.companyLogoUrl ?? null,
          },
        });
      }

      setTimeout(() => router.push("/users/employer/profile"), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => router.push("/users/employer/profile");

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#eef5ff] px-4 pb-12 pt-4 sm:px-6">
        <div className="mx-auto max-w-305 space-y-4 animate-pulse">
          <div className="h-9 w-40 rounded-xl bg-gray-200" />
          <div className="h-[700px] rounded-[28px] bg-gray-200" />
        </div>
      </div>
    );
  }

  const logoInitial = form.name.trim().charAt(0).toUpperCase() || "?";
  const isBusy = isSaving || isUploadingLogo || isUploadingCover;

  // ── Spinner SVG ─────────────────────────────────────────────────────────────
  const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#eef5ff] px-4 pb-12 pt-4 sm:px-6">
      <div className="mx-auto max-w-305">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/users/employer/profile" className="flex items-center gap-2 text-sm font-medium text-[#667085] transition hover:text-[#2563eb]">
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <button type="button" onClick={handleCancel} className="w-full rounded-xl border border-[#e5e7eb] bg-white px-5 py-2.5 text-sm font-semibold text-[#667085] transition hover:bg-gray-50 sm:w-auto">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={isBusy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#7c3aed] to-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-70 sm:w-auto">
              {isSaving ? <><Spinner />Saving...</> : <><Save className="h-4 w-4" />Save Changes</>}
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error   && <div className="mb-4 rounded-xl border border-red-200   bg-red-50   px-4 py-3 text-sm font-medium text-red-700"  >{error}</div>}
        {success && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="rounded-[28px] border border-[#dbe7ff] bg-white p-5 sm:p-6 lg:p-8">
            <div className="mb-6 border-b border-[#e5e7eb] pb-6">
              <h1 className="text-2xl font-bold text-[#111827]">Edit Company Profile</h1>
              <p className="mt-1 text-sm text-[#667085]">Update your company information to attract top talent</p>
            </div>

            <div className="flex flex-col gap-6 lg:gap-7">

              {/* ── Brand Identity ─────────────────────────────────────────── */}
              <section className="rounded-3xl border border-[#e5e7eb] p-5 sm:p-6">
                <h2 className="mb-5 text-xl font-bold text-[#2563eb]">Brand Identity</h2>

                <div className="grid items-start gap-6 lg:grid-cols-2">
                  {/* Logo */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#111827]">Company Logo</label>
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        {form.logoUrl ? (
                          <div className="relative h-20 w-20 overflow-hidden rounded-2xl">
                            <Image src={form.logoUrl} alt="Logo" fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#101828] text-2xl font-bold text-white">{logoInitial}</div>
                        )}
                        <label htmlFor="logo-upload" className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#2563eb] text-white transition hover:bg-[#1d4ed8]">
                          {isUploadingLogo ? <Spinner /> : <Camera className="h-4 w-4" />}
                        </label>
                        <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} disabled={isUploadingLogo} className="hidden" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-[#667085]">Upload a logo. Recommended: 200×200px</p>
                        <p className="mt-1 text-xs text-[#9ca3af]">PNG, JPG or SVG · Max 2MB</p>
                        {form.logoUrl && (
                          <button type="button" onClick={() => setForm((p) => ({ ...p, logoUrl: "" }))} className="mt-2 flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700">
                            <Trash2 className="h-3 w-3" /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Logo initial — read-only hint */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#111827]">Company Initial (Fallback)</label>
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#101828] text-2xl font-bold text-white">{logoInitial}</div>
                    <p className="mt-2 text-xs text-[#9ca3af]">Derived from company name · shown when logo is unavailable</p>
                  </div>
                </div>

                {/* Cover image */}
                <div className="mt-6">
                  <label className="mb-2 block text-sm font-semibold text-[#111827]">Cover Image</label>
                  <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-[#e5e7eb] transition hover:border-[#2563eb]">
                    {form.coverImageUrl ? (
                      <div className="relative h-50 w-full">
                        <Image src={form.coverImageUrl} alt="Cover" fill className="object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition hover:opacity-100">
                          <label htmlFor="cover-upload-change" className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#111827] hover:bg-gray-100">
                            <Upload className="h-4 w-4" />Change
                          </label>
                          <input id="cover-upload-change" type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                          <button type="button" onClick={() => setForm((p) => ({ ...p, coverImageUrl: "" }))} className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">
                            <Trash2 className="h-4 w-4" />Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <label htmlFor="cover-upload-empty" className="flex h-50 cursor-pointer flex-col items-center justify-center gap-3">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eef5ff]">
                            {isUploadingCover ? <Spinner /> : <Upload className="h-6 w-6 text-[#2563eb]" />}
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-[#111827]">Click to upload cover image</p>
                            <p className="mt-1 text-xs text-[#9ca3af]">Recommended: 1200×400px, PNG or JPG</p>
                          </div>
                        </label>
                        <input id="cover-upload-empty" type="file" accept="image/*" onChange={handleCoverUpload} disabled={isUploadingCover} className="hidden" />
                      </>
                    )}
                  </div>
                </div>
              </section>

              {/* ── Basic Information ──────────────────────────────────────── */}
              <section className="rounded-3xl border border-[#e5e7eb] p-5 sm:p-6">
                <h2 className="mb-5 text-xl font-bold text-[#2563eb]">Basic Information</h2>
                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="lg:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-[#111827]">Company Name <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} required maxLength={200} className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[#111827] outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/20" placeholder="Enter your company name" />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-[#111827]">Company Description <span className="text-red-500">*</span></label>
                    <textarea name="description" value={form.description} onChange={handleChange} required rows={4} maxLength={2000} className="w-full resize-none rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[#111827] outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/20" placeholder="Describe your company, mission, and what makes you unique..." />
                    <p className="mt-1 text-right text-xs text-[#9ca3af]">{form.description.length}/2000</p>
                  </div>
                  <div className="lg:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-[#111827]">Website</label>
                    <div className="relative">
                      <Link2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                      <input type="url" name="website" value={form.website} onChange={handleChange} maxLength={500} className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] py-3 pl-11 pr-4 text-[#111827] outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/20" placeholder="https://yourcompany.com" />
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Company Details ────────────────────────────────────────── */}
              <section className="rounded-3xl border border-[#e5e7eb] p-5 sm:p-6">
                <h2 className="mb-5 text-xl font-bold text-[#2563eb]">Company Details</h2>
                <div className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#111827]"><Briefcase className="h-4 w-4 text-[#2563eb]" />Industry</label>
                    <select name="industry" value={form.industry} onChange={handleChange} className="w-full appearance-none rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[#111827] outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/20">
                      <option value="">Select industry</option>
                      {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#111827]"><Building2 className="h-4 w-4 text-[#2563eb]" />Company Type</label>
                    <select name="companyType" value={form.companyType} onChange={handleChange} className="w-full appearance-none rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[#111827] outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/20">
                      <option value="">Select type</option>
                      {COMPANY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#111827]"><Users className="h-4 w-4 text-[#2563eb]" />Company Size</label>
                    <select name="companySize" value={form.companySize} onChange={handleChange} className="w-full appearance-none rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[#111827] outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/20">
                      <option value="">Select size</option>
                      {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#111827]"><CalendarDays className="h-4 w-4 text-[#2563eb]" />Founded Year</label>
                    <input type="number" name="foundedYear" value={form.foundedYear} onChange={handleChange} min="1800" max={new Date().getFullYear()} className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[#111827] outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/20" placeholder="2017" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#111827]"><Globe className="h-4 w-4 text-[#2563eb]" />Location</label>
                    <input type="text" name="location" value={form.location} onChange={handleChange} maxLength={255} className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[#111827] outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/20" placeholder="City, State, Country" />
                  </div>
                </div>
              </section>

              {/* ── Specialties ────────────────────────────────────────────── */}
              <section className="rounded-3xl border border-[#e5e7eb] p-5 sm:p-6">
                <h2 className="mb-5 text-xl font-bold text-[#2563eb]">Specialties</h2>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#111827]">Areas of Expertise</label>
                  <textarea name="specialties" value={form.specialties} onChange={handleChange} rows={3} maxLength={2000} className="w-full resize-none rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[#111827] outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/20" placeholder="Enter your company's specialties, separated by commas..." />
                  <p className="mt-2 text-xs text-[#9ca3af]">Separate each specialty with a comma (e.g., Cloud Computing, AI/ML, Data Analytics)</p>
                </div>
                {form.specialties && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-[#667085]">Preview:</p>
                    <div className="flex flex-wrap gap-2">
                      {form.specialties.split(",").map((s, i) =>
                        s.trim() && (
                          <span key={i} className="inline-flex items-center gap-1 rounded-full bg-[#eef5ff] px-3 py-1.5 text-xs font-medium text-[#2563eb]">{s.trim()}</span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </section>

              {/* ── Social Links ───────────────────────────────────────────── */}
              <section className="rounded-3xl border border-[#e5e7eb] p-5 sm:p-6">
                <h2 className="mb-5 text-xl font-bold text-[#2563eb]">Social Links</h2>
                <div className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#111827]">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-[#0A66C2]"><FaLinkedinIn className="h-3 w-3 text-white" /></div>LinkedIn
                    </label>
                    <input type="url" name="linkedIn" value={form.linkedIn} onChange={handleChange} className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[#111827] outline-none transition focus:border-[#0A66C2] focus:bg-white focus:ring-2 focus:ring-[#0A66C2]/20" placeholder="https://linkedin.com/company/..." />
                  </div>
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#111827]">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-[#1877F2]"><FaFacebookF className="h-3 w-3 text-white" /></div>Facebook
                    </label>
                    <input type="url" name="facebook" value={form.facebook} onChange={handleChange} className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[#111827] outline-none transition focus:border-[#1877F2] focus:bg-white focus:ring-2 focus:ring-[#1877F2]/20" placeholder="https://facebook.com/..." />
                  </div>
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#111827]">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-[#111827]"><FaXTwitter className="h-3 w-3 text-white" /></div>X (Twitter)
                    </label>
                    <input type="url" name="twitter" value={form.twitter} onChange={handleChange} className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[#111827] outline-none transition focus:border-[#111827] focus:bg-white focus:ring-2 focus:ring-[#111827]/20" placeholder="https://twitter.com/..." />
                  </div>
                </div>
                <div className="mt-6 rounded-2xl bg-[#f9fafb] p-4">
                  <p className="mb-3 text-sm font-medium text-[#667085]">Preview:</p>
                  <div className="flex gap-3">
                    {form.linkedIn && <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A66C2] text-white"><FaLinkedinIn size={20} /></div>}
                    {form.facebook && <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1877F2] text-white"><FaFacebookF size={20} /></div>}
                    {form.twitter  && <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#111827] text-white"><FaXTwitter size={18} /></div>}
                    {!form.linkedIn && !form.facebook && !form.twitter && <p className="text-sm text-[#9ca3af]">Add social links to see preview</p>}
                  </div>
                </div>
              </section>

              {/* ── Danger Zone ────────────────────────────────────────────── */}
              <section className="rounded-3xl border border-red-200 bg-red-50/50 p-5 sm:p-6">
                <h2 className="mb-2 text-xl font-bold text-red-600">Danger Zone</h2>
                <p className="mb-4 text-sm text-[#667085]">Irreversible and destructive actions</p>
                <button type="button" className="flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />Deactivate Profile
                </button>
              </section>

            </div>
          </div>

          {/* Mobile bottom bar */}
          <div className="fixed bottom-0 left-0 right-0 border-t border-[#e5e7eb] bg-white p-4 lg:hidden">
            <div className="flex gap-3">
              <button type="button" onClick={handleCancel} className="flex-1 rounded-xl border border-[#e5e7eb] bg-white px-5 py-3 text-sm font-semibold text-[#667085] transition hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={isBusy} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#7c3aed] to-[#2563eb] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-70">
                {isSaving ? <><Spinner />Saving...</> : <><Save className="h-4 w-4" />Save</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}