import Image from "next/image";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  CalendarDays,
  ExternalLink,
  Globe,
  Pencil,
  Users,
} from "lucide-react";
import { FaLinkedinIn, FaFacebookF, FaXTwitter } from "react-icons/fa6";

export default function EmployerProfilePage() {
  return (
    <div className="min-h-screen bg-[#eef5ff] px-4 pb-4 pt-0 sm:px-6">
      <div className="mx-auto max-w-305 rounded-[28px] border border-[#dbe7ff] bg-white p-6">
        <div className="flex flex-col gap-5">
          {/* Top section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_1fr]">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#101828] text-sm font-bold text-white">
                R
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#111827]">
                  Rackspace
                </h1>

                <p className="mt-3 max-w-2xl text-[15px] leading-8 text-[#475467]">
                  Rackspace is a global IT services company that specializes in cloud
                  computing and managed IT solutions. The company helps businesses
                  design, build, and manage secure cloud environments across public,
                  private, and hybrid platforms.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/users/employer/profile/edit"
                    className="flex items-center gap-2 rounded-xl bg-linear-to-r from-[#7c3aed] to-[#2563eb] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Page
                  </Link>

                  <a
                    href="https://rackspace.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-[#3b82f6] bg-white px-6 py-3 text-sm font-semibold text-[#2563eb] transition hover:bg-blue-50"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit us
                  </a>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-gray-100">
              <Image
                src="/images/company/Rackspace.jpg"
                alt="Company"
                width={500}
                height={300}
                className="h-57.5 w-full object-cover"
              />
            </div>
          </div>

          {/* Bottom section */}
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
            {/* Left column */}
            <div className="flex flex-col gap-5 self-start">
              <div className="rounded-3xl border border-[#e5e7eb] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <h2 className="mb-4 text-2xl font-bold text-[#2563eb]">Details</h2>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Briefcase className="mt-0.5 h-4 w-4 text-[#2563eb]" />
                    <div>
                      <p className="font-semibold text-[#111827]">Industry</p>
                      <p className="text-[#667085]">Software Development</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="mt-0.5 h-4 w-4 text-[#2563eb]" />
                    <div>
                      <p className="font-semibold text-[#111827]">Type</p>
                      <p className="text-[#667085]">Private</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-4 w-4 text-[#2563eb]" />
                    <div>
                      <p className="font-semibold text-[#111827]">Verified Page</p>
                      <p className="text-[#667085]">June 23, 2024</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="mt-0.5 h-4 w-4 text-[#2563eb]" />
                    <div>
                      <p className="font-semibold text-[#111827]">Company Size</p>
                      <p className="text-[#667085]">200–1000 employees</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-4 w-4 text-[#2563eb]" />
                    <div>
                      <p className="font-semibold text-[#111827]">Founded</p>
                      <p className="text-[#667085]">2017</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Globe className="mt-0.5 h-4 w-4 text-[#2563eb]" />
                    <div>
                      <p className="font-semibold text-[#111827]">Location</p>
                      <p className="text-[#667085]">San Francisco, CA, USA</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-[#e5e7eb] p-5">
                <h2 className="mb-4 text-2xl font-bold text-[#2563eb]">Specialties</h2>
                <p className="text-[15px] leading-8 text-[#475467]">
                  Enterprise API Management, Identity & Access Management (IAM),
                  Cloud-Native Integration Platforms, Integration Platform as a Service
                  (iPaaS), Ballerina Language, Choreo, Secure Enterprise Integrations.
                </p>
              </div>

              <div className="rounded-3xl border border-[#e5e7eb] p-5">
                <h2 className="mb-4 text-2xl font-bold text-[#2563eb]">Social Links</h2>

                <div className="flex gap-3">
                  <a
                    href="#"
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A66C2] text-white transition hover:scale-105"
                  >
                    <FaLinkedinIn size={20} />
                  </a>

                  <a
                    href="#"
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1877F2] text-white transition hover:scale-105"
                  >
                    <FaFacebookF size={20} />
                  </a>

                  <a
                    href="#"
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#111827] text-white transition hover:scale-105"
                  >
                    <FaXTwitter size={18} />
                  </a>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-5 self-start">
              <div className="rounded-3xl border border-[#e5e7eb] bg-linear-to-b from-white to-[#fafcff] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#2563eb]">
                    Recent Job Openings
                  </h2>
                  <button className="text-sm font-semibold text-[#2563eb] transition hover:underline">
                    View all →
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="group rounded-2xl bg-[#f4f8ff] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#edf4ff]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#111827] text-sm font-bold text-white">
                          R
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[#111827] transition group-hover:text-[#2563eb]">
                            UX/UI Designer
                          </h3>
                          <p className="mt-0.5 text-sm text-[#667085]">Software</p>
                        </div>
                      </div>

                      <span className="rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-[#16a34a]">
                        Active
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dbeafe] px-3 py-1 text-xs font-medium text-[#2563eb]">
                        Full-time
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e0f2fe] px-3 py-1 text-xs font-medium text-[#0284c7]">
                        On site
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffedd5] px-3 py-1 text-xs font-medium text-[#ea580c]">
                        $1000 - $1100
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm text-[#667085]">
                      <span className="font-medium text-[#22c55e]">24 Applicants</span>
                      <span className="text-[#f4b400]">•</span>
                      <span>Posted 5 days ago</span>
                    </div>
                  </div>

                  <div className="group rounded-2xl bg-[#f4f8ff] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#edf4ff]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#111827] text-sm font-bold text-white">
                          R
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[#111827] transition group-hover:text-[#2563eb]">
                            Frontend Developer
                          </h3>
                          <p className="mt-0.5 text-sm text-[#667085]">Engineering</p>
                        </div>
                      </div>

                      <span className="rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-[#16a34a]">
                        Active
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dbeafe] px-3 py-1 text-xs font-medium text-[#2563eb]">
                        Full-time
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ede9fe] px-3 py-1 text-xs font-medium text-[#7c3aed]">
                        Hybrid
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffedd5] px-3 py-1 text-xs font-medium text-[#ea580c]">
                        $1200 - $1500
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm text-[#667085]">
                      <span className="font-medium text-[#22c55e]">18 Applicants</span>
                      <span className="text-[#f4b400]">•</span>
                      <span>Posted 3 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}