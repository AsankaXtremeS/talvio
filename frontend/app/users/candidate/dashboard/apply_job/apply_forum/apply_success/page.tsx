"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, Check, Clock3, X } from "lucide-react";

type JobMeta = {
	id: string;
	title: string;
	company: string;
};

const JOBS: JobMeta[] = [
	{ id: "1", title: "Software Engineering Intern", company: "Google" },
	{ id: "2", title: "Data Analyst Intern", company: "Microsoft" },
	{ id: "3", title: "UI/UX Design Intern", company: "Figma" },
	{ id: "4", title: "Marketing Intern", company: "Airbnb" },
];

function BlurredDashboardMock() {
	return (
		<div className="fixed inset-0 bg-[#E8EFF8]">
			<div className="grid h-full grid-cols-[210px_minmax(0,1fr)] gap-4 p-4">
				<aside className="rounded-2xl border border-[#D7DFEB] bg-white/88 p-4 shadow-sm">
					<div className="mb-6 flex items-center justify-between">
						<p className="text-[30px] font-extrabold leading-none tracking-tight text-slate-900">Talvio</p>
						<div className="h-8 w-8 rounded-md border border-slate-200 bg-white" />
					</div>

					<div className="mb-5 rounded-2xl bg-slate-50 p-3">
						<div className="h-3 w-24 rounded-full bg-slate-200" />
						<div className="mt-2 h-2 w-20 rounded-full bg-slate-100" />
					</div>

					<p className="mb-3 text-xs font-semibold tracking-wide text-slate-400">MAIN MENU</p>
					<div className="space-y-2 text-[13px]">
						<div className="rounded-xl bg-indigo-100/80 px-3 py-2 font-semibold text-indigo-700">Dashboard</div>
						<div className="rounded-xl px-3 py-2 text-slate-500">Applications</div>
						<div className="rounded-xl px-3 py-2 text-slate-500">Analytics</div>
						<div className="rounded-xl px-3 py-2 text-slate-500">Interview</div>
						<div className="rounded-xl px-3 py-2 text-slate-500">Resume</div>
					</div>

					<div className="mt-[340px] rounded-xl bg-indigo-600 px-3 py-2 text-center text-xs font-semibold text-white">
						Sign out
					</div>
				</aside>

				<div className="space-y-4">
					<div className="flex items-center justify-end px-3 pt-1">
						<div className="flex h-10 items-center rounded-full border border-[#DAE2EE] bg-white px-4 text-[11px] font-semibold text-slate-500">
							<CalendarDays size={14} className="mr-2" />
							Wednesday, December 25, 2025
						</div>
					</div>

					<div className="grid grid-cols-[minmax(0,1fr)_270px] gap-4">
						<div className="space-y-4">
							<div className="h-[120px] rounded-2xl bg-white/75" />
							<div className="h-[460px] rounded-2xl bg-white/70" />
						</div>
						<div className="space-y-4 pt-16">
							<div className="rounded-3xl bg-white/78 p-4">
								<p className="text-[13px] font-semibold text-slate-600">Upcoming interview</p>
								<div className="mt-3 space-y-2 text-xs text-slate-400">
									<p className="flex items-center gap-2">
										<CalendarDays size={13} /> Wednesday, December 25, 2025
									</p>
									<p className="flex items-center gap-2">
										<Clock3 size={13} /> 09:45 A.M
									</p>
								</div>
							</div>
							<div className="rounded-3xl bg-white/80 p-4">
								<div className="mx-auto h-28 w-28 rounded-full border-[8px] border-[#2462E6] border-r-[#BFD2FD]" />
								<p className="mt-3 text-center text-[13px] font-semibold text-slate-700">Your resume score</p>
								<p className="mt-1 text-center text-xs text-slate-400">you can use your ai resume and improve</p>
								<div className="mt-3 h-10 rounded-xl bg-[#2C60E8]" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function CandidateApplySuccessPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const jobId = searchParams.get("jobId") ?? "1";
	const selectedJob = JOBS.find((job) => job.id === jobId) ?? JOBS[0];

	return (
		<div className="fixed inset-0 z-[9999] overflow-y-auto overflow-x-hidden [&_button:not(:disabled)]:cursor-pointer">
			<BlurredDashboardMock />
			<div className="fixed inset-0 bg-[#D8E3F0]/64 backdrop-blur-[5px]" />

			<div className="relative z-10 mx-auto flex min-h-full max-w-[1240px] items-start justify-center px-3 py-4 sm:px-4 sm:py-5">
				<div className="relative w-full max-w-[520px] rounded-2xl border border-[#D5D9E0] bg-[#F2F3F5] p-3 shadow-[0_24px_65px_rgba(38,58,94,0.20)] sm:p-4">
					<button
						onClick={() => router.push("/users/candidate/dashboard")}
						className="absolute right-2 top-2 z-20 flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm border border-[#A9AFBC] bg-white text-slate-500 transition hover:bg-slate-100"
						aria-label="Close"
					>
						<X size={14} />
					</button>

					<div className="rounded-[24px] bg-[#DDEAF6] px-6 pb-7 pt-8 sm:px-8">
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#35C4B3]">
							<Check size={30} className="text-white" strokeWidth={3.4} />
						</div>

						<h1 className="mt-6 text-center text-[26px] font-extrabold leading-[1.06] tracking-[-0.02em] text-slate-900 sm:text-[28px]">
							Application Submitted Successfully!
						</h1>

						<p className="mx-auto mt-3 max-w-[290px] text-center text-[9px] font-medium text-[#3A6CA9] underline decoration-[#7DA8D7] decoration-[0.6px] underline-offset-[2px] sm:text-[10px]">
							Your application for the {selectedJob.title} position has been sent.
						</p>

						<div className="mt-8 w-full rounded-2xl bg-[#F4F4F6] px-8 py-9">
							<p className="text-[20px] leading-tight text-slate-500 sm:text-[22px]">
								Job - <span className="font-semibold text-slate-800">{selectedJob.title}</span>
							</p>
							<p className="mt-1 text-[20px] leading-tight text-slate-500 sm:text-[22px]">
								Company - <span className="font-semibold text-slate-800">{selectedJob.company}</span>
							</p>

							<div className="mt-11 text-center">
								<p className="text-[10px] text-slate-400 sm:text-[11px]">Status</p>
								<div className="mx-auto mt-2 inline-flex rounded-full border border-dashed border-[#4770F4] px-3 py-1 text-[9px] font-semibold text-[#2E5BE8] sm:text-[10px]">
									Under Review
								</div>
							</div>
						</div>

						<div className="mt-8 space-y-3">
							<button
								onClick={() => router.push("/users/candidate/dashboard/apply_job")}
								className="h-[44px] w-full cursor-pointer rounded-[12px] bg-gradient-to-r from-[#5630DA] to-[#2462E6] px-6 text-[16px] font-medium text-white shadow-[0_7px_18px_rgba(44,88,224,0.30)] transition hover:brightness-105 sm:text-[17px]"
							>
								View Application
							</button>
							<button
								onClick={() => router.push("/users/candidate/dashboard")}
								className="h-[44px] w-full cursor-pointer rounded-[12px] border border-[#7D94EE] bg-transparent px-6 text-[16px] font-medium text-[#3557DB] transition hover:bg-[#EAF0FD] sm:text-[17px]"
							>
								Go to Dashboard
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
