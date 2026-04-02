"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Building2,
	Calendar,
	Clock3,
	DollarSign,
	Globe,
	User,
	X,
} from "lucide-react";

interface JobDetail {
	id: string;
	title: string;
	company: string;
	location: string;
	postedAgo: string;
	tags: string[];
	companyLogoUrl?: string;
	companyDescription: string;
	companyProfileUrl: string;
	aboutRole: string;
	responsibilities: string[];
	requirements: string[];
	role: string;
	duration: string;
	stipend: string;
	workMode: string;
}

const JOBS: JobDetail[] = [
	{
		id: "1",
		title: "Frontend Developer Intern",
		company: "Google",
		location: "Mountain View, CA",
		postedAgo: "2 days ago",
		tags: ["Remote", "Full time", "Paid", "6 months"],
		companyLogoUrl: "google",
		companyDescription:
			"Google is a global technology company focused on building innovative products that improve everyday life.",
		companyProfileUrl: "https://google.com",
		aboutRole:
			"As a Software Engineering Intern, you will work with experienced engineers to design, develop, and maintain scalable software solutions.",
		responsibilities: [
			"Assist in developing web applications",
			"Write clean and maintainable code",
			"Collaborate with cross-functional teams",
		],
		requirements: [
			"Undergraduate in Computer Science or related field",
			"Basic knowledge of JavaScript, React, or Java",
			"Good problem-solving skills",
		],
		role: "Software Engineer Intern",
		duration: "6 months",
		stipend: "Paid",
		workMode: "Remote",
	},
	{
		id: "2",
		title: "Data Analyst Intern",
		company: "Microsoft",
		location: "Redmond, WA",
		postedAgo: "1 day ago",
		tags: ["Onsite", "Full time", "Paid", "3 months"],
		companyLogoUrl: "microsoft",
		companyDescription:
			"Microsoft is a global leader in software, services, devices, and solutions.",
		companyProfileUrl: "https://microsoft.com",
		aboutRole:
			"Join the Microsoft team to work on data products, analytics pipelines, and dashboards used across global teams.",
		responsibilities: [
			"Build and maintain reporting dashboards",
			"Analyze trends and communicate insights",
			"Work with engineers and product managers",
		],
		requirements: [
			"Pursuing a degree in Computer Science or Statistics",
			"Strong Excel, SQL, or Python fundamentals",
			"Clear communication and teamwork",
		],
		role: "Data Analyst Intern",
		duration: "3 months",
		stipend: "Paid",
		workMode: "Onsite",
	},
	{
		id: "3",
		title: "UI/UX Design Intern",
		company: "Figma",
		location: "San Francisco, CA",
		postedAgo: "3 days ago",
		tags: ["Hybrid", "Full time", "Paid", "4 months"],
		companyLogoUrl: "figma",
		companyDescription:
			"Figma is a collaborative interface design tool used by product teams around the world.",
		companyProfileUrl: "https://figma.com",
		aboutRole:
			"Work closely with design and product teams to craft simple and delightful user experiences.",
		responsibilities: [
			"Create wireframes and clickable prototypes",
			"Collaborate on design systems",
			"Conduct quick usability checks",
		],
		requirements: [
			"Portfolio showing web or mobile product design",
			"Experience with Figma",
			"Strong visual and interaction design fundamentals",
		],
		role: "UI/UX Design Intern",
		duration: "4 months",
		stipend: "Paid",
		workMode: "Hybrid",
	},
	{
		id: "4",
		title: "Marketing Intern",
		company: "Airbnb",
		location: "Seattle, WA",
		postedAgo: "4 days ago",
		tags: ["Remote", "Part time", "Paid", "3 months"],
		companyLogoUrl: "airbnb",
		companyDescription:
			"Airbnb helps create a world where anyone can belong anywhere through unique stays and experiences.",
		companyProfileUrl: "https://airbnb.com",
		aboutRole:
			"Help plan and execute campaign ideas that connect with community and growth goals.",
		responsibilities: [
			"Support campaign planning and execution",
			"Track engagement and campaign performance",
			"Coordinate with content and design teams",
		],
		requirements: [
			"Strong writing and communication skills",
			"Interest in digital marketing",
			"Data-informed decision making",
		],
		role: "Marketing Intern",
		duration: "3 months",
		stipend: "Paid",
		workMode: "Remote",
	},
];

function GoogleLogo() {
	return (
		<svg viewBox="0 0 48 48" className="h-full w-full">
			<path
				fill="#EA4335"
				d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
			/>
			<path
				fill="#4285F4"
				d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
			/>
			<path
				fill="#FBBC05"
				d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
			/>
			<path
				fill="#34A853"
				d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
			/>
		</svg>
	);
}

function SideMockCard() {
	return (
		<div className="rounded-3xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
			<div className="mb-3 h-3 w-24 rounded-full bg-slate-200" />
			<div className="mb-5 h-2 w-16 rounded-full bg-slate-100" />
			<div className="space-y-2">
				<div className="h-2 w-full rounded-full bg-slate-100" />
				<div className="h-2 w-4/5 rounded-full bg-slate-100" />
			</div>
			<button className="mt-6 h-10 w-full rounded-xl bg-indigo-600/85 text-sm font-semibold text-white">
				Apply now
			</button>
		</div>
	);
}

export default function CandidateApplyJobPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const jobId = searchParams.get("jobId");
	const storageKey = "candidateAppliedJobIds";

	const job = useMemo(() => JOBS.find((item) => item.id === jobId) ?? JOBS[0], [jobId]);

	const isApplied = useMemo(() => {
		if (typeof window === "undefined") return false;
		try {
			const parsed: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
			return Array.isArray(parsed) && parsed.includes(job.id);
		} catch {
			return false;
		}
	}, [job.id]);

	const overviewItems = [
		{ icon: <User size={15} />, label: "Role", value: job.role },
		{ icon: <Clock3 size={15} />, label: "Duration", value: job.duration },
		{ icon: <DollarSign size={15} />, label: "Stipend", value: job.stipend },
		{ icon: <Globe size={15} />, label: "Work Mode", value: job.workMode },
		{ icon: <Calendar size={15} />, label: "Posted", value: job.postedAgo },
	];

	const handleApply = () => {
		router.push(`/users/candidate/dashboard/apply_job/apply_forum?jobId=${job.id}`);
	};

	return (
		<div className="fixed inset-0 z-[70] overflow-y-auto px-4 py-5 sm:px-6 [&_button:not(:disabled)]:cursor-pointer">
			<div className="pointer-events-none fixed inset-0 bg-[#D9E2EF]/46 backdrop-blur-xl backdrop-saturate-125 supports-[backdrop-filter]:bg-[#D9E2EF]/34" />
			<div className="relative mx-auto grid max-w-[1220px] gap-6 lg:grid-cols-[240px_minmax(0,1fr)_240px]">
				<div className="hidden pt-2 lg:block">
					<div className="space-y-4 opacity-35 blur-[5px] saturate-75">
						<SideMockCard />
						<div className="rounded-3xl border border-white/55 bg-white/65 p-6 shadow-sm backdrop-blur-sm">
							<div className="h-2 w-28 rounded-full bg-slate-200" />
							<div className="mt-4 h-24 rounded-2xl border-8 border-slate-200" />
						</div>
					</div>
				</div>

				<div className="relative">
					<button
						onClick={() => router.push("/users/candidate/dashboard")}
						className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
						aria-label="Close"
					>
						<X size={16} />
					</button>

					<div className="rounded-2xl border border-[#D5DEE9] bg-white/90 p-4 shadow-sm sm:p-6">
						<div className="rounded-[28px] border border-[#C8D6E7] bg-[#EEF5FC] p-4 sm:p-6">
							<div className="rounded-2xl border border-[#CFDDED] bg-white/80 p-4">
								<div className="flex flex-wrap items-start justify-between gap-3">
									<div className="flex items-center gap-3">
										<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white shadow-sm">
											{job.companyLogoUrl === "google" ? (
												<div className="h-8 w-8">
													<GoogleLogo />
												</div>
											) : (
												<span className="text-lg font-bold text-indigo-600">{job.company.charAt(0)}</span>
											)}
										</div>

										<div>
											<p className="text-[20px] font-bold leading-tight text-gray-900">{job.title}</p>
											<p className="text-sm font-medium text-indigo-500">
												{job.company} - {job.location}
											</p>
										</div>
									</div>

									<button
										onClick={handleApply}
										disabled={isApplied}
										className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-emerald-600"
									>
										{isApplied ? "Applied" : "Apply now"}
									</button>
								</div>

								<div className="mt-4 flex flex-wrap gap-2">
									{job.tags.map((tag) => (
										<span
											key={tag}
											className="rounded-full border border-sky-200 bg-sky-50 px-4 py-1 text-xs font-medium text-sky-700"
										>
											{tag}
										</span>
									))}
								</div>
							</div>

							<div className="mt-4 grid gap-4 md:grid-cols-2">
								<div className="rounded-xl border border-[#CFDDED] bg-white/80 p-5">
									<h2 className="text-lg font-bold text-gray-800">Job Overview</h2>
									<div className="mt-4 space-y-3">
										{overviewItems.map((item) => (
											<div key={item.label} className="flex items-center gap-2 text-sm">
												<span className="text-gray-400">{item.icon}</span>
												<span className="text-gray-500">{item.label}:</span>
												<span className="font-semibold text-gray-800">{item.value}</span>
											</div>
										))}
									</div>
								</div>

								<div className="rounded-xl border border-[#CFDDED] bg-white/80 p-5">
									<h2 className="text-lg font-bold text-gray-800">Company</h2>
									<div className="mt-3 flex h-10 items-center">
										{job.companyLogoUrl === "google" ? (
											<div className="h-9 w-24">
												<GoogleLogo />
											</div>
										) : (
											<span className="text-2xl font-bold text-indigo-600">{job.company}</span>
										)}
									</div>

									<p className="mt-3 text-xs leading-relaxed text-gray-500">{job.companyDescription}</p>
									<a
										href={job.companyProfileUrl}
										target="_blank"
										rel="noreferrer"
										className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline"
									>
										<Building2 size={15} />
										Visit company profile
									</a>
								</div>
							</div>

							<div className="mt-4 rounded-[28px] border border-[#CFDDED] bg-white/80 p-5 sm:p-6">
								<h2 className="text-xl font-bold text-gray-800">About the Role</h2>
								<p className="mt-4 text-sm leading-relaxed text-gray-600">{job.aboutRole}</p>

								<h3 className="mt-6 text-lg font-bold text-gray-800">Responsibilities</h3>
								<ul className="mt-3 space-y-2">
									{job.responsibilities.map((item) => (
										<li key={item} className="flex items-start gap-2 text-sm text-gray-600">
											<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-500" />
											{item}
										</li>
									))}
								</ul>

								<h3 className="mt-6 text-lg font-bold text-gray-800">Requirements</h3>
								<ul className="mt-3 space-y-2">
									{job.requirements.map((item) => (
										<li key={item} className="flex items-start gap-2 text-sm text-gray-600">
											<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-500" />
											{item}
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				</div>

				<div className="hidden pt-2 lg:block">
					<div className="space-y-4 opacity-35 blur-[5px] saturate-75">
						<div className="rounded-3xl border border-white/55 bg-white/65 p-5 shadow-sm backdrop-blur-sm">
							<div className="mb-4 h-3 w-32 rounded-full bg-slate-200" />
							<div className="space-y-2">
								<div className="h-2 w-full rounded-full bg-slate-100" />
								<div className="h-2 w-4/5 rounded-full bg-slate-100" />
								<div className="h-2 w-2/3 rounded-full bg-slate-100" />
							</div>
						</div>
						<SideMockCard />
					</div>
				</div>
			</div>
		</div>
	);
}
