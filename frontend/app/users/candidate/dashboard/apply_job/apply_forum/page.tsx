"use client";

import { useRef, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AICoverLetterModal from "@/components/candidate/dashboard/AICoverLetterModal";
import {
	CalendarDays,
	FileText,
	LayoutDashboard,
	LogOut,
	Search,
	Settings,
	Sparkles,
	Upload,
	X,
} from "lucide-react";

type JobItem = {
	id: string;
	title: string;
};

const JOBS: JobItem[] = [
	{ id: "1", title: "Software Engineering - Intern" },
	{ id: "2", title: "Data Analyst - Intern" },
	{ id: "3", title: "UI/UX Design - Intern" },
	{ id: "4", title: "Marketing - Intern" },
];

function DashboardBackdrop() {
	return (
		<div className="absolute inset-0 bg-[#E8EFF9]">
			<div className="grid h-full grid-cols-[248px_minmax(0,1fr)] gap-4 p-4">
				<aside className="rounded-3xl border border-[#D9DEE8] bg-white p-4 shadow-sm">
					<div className="mb-5 flex items-center justify-between">
						<h2 className="text-[40px] font-bold leading-none text-slate-900/15">Talvio</h2>
						<div className="h-8 w-8 rounded-md border border-slate-200 bg-white" />
					</div>

					<div className="mb-5 rounded-2xl bg-slate-50 p-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
									s
								</div>
								<div>
									<p className="text-lg font-semibold text-slate-900/30">sandip1719trsm</p>
									<p className="text-sm text-slate-500/60">Undergraduate</p>
								</div>
							</div>
							<Settings size={16} className="text-slate-400/60" />
						</div>
					</div>

					<p className="mb-3 text-sm font-semibold tracking-wide text-slate-500/60">MAIN MENU</p>
					<div className="space-y-2 text-[31px]">
						<div className="flex items-center gap-3 rounded-2xl bg-indigo-100/70 px-4 py-3 font-semibold text-indigo-700/80">
							<LayoutDashboard size={20} /> Dashboard
						</div>
						<div className="flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-500/70">
							<FileText size={20} /> Applications
						</div>
						<div className="flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-500/70">
							<Settings size={20} /> Recommendations
						</div>
					</div>

					<button className="mt-[330px] flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-indigo-600 text-xl font-semibold text-white/60">
						<LogOut size={20} /> Sign Out
					</button>
				</aside>

				<div className="space-y-4 pt-2">
					<div className="flex items-center gap-4">
						<div className="flex h-14 flex-1 items-center rounded-full border border-slate-200 bg-white px-4 text-lg text-slate-500/60">
							<Search size={18} className="mr-3" /> Search candidates, jobs, ...
						</div>
						<div className="flex h-14 items-center rounded-full border border-slate-200 bg-white px-5 text-lg font-semibold text-slate-600/70">
							<CalendarDays size={16} className="mr-2" /> Tuesday, March 31, 2026
						</div>
					</div>

					<div className="h-20 rounded-2xl bg-indigo-200/45" />
					<div className="grid grid-cols-[minmax(0,1fr)_290px] gap-4">
						<div className="space-y-4">
							<div className="h-20 rounded-2xl bg-white/55" />
							<div className="h-[420px] rounded-2xl bg-white/60" />
						</div>
						<div className="space-y-4">
							<div className="h-40 rounded-3xl bg-white/60" />
							<div className="h-[310px] rounded-3xl bg-white/60" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function CandidateApplyForumPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const jobId = searchParams.get("jobId") ?? "1";
	const storageKey = "candidateAppliedJobIds";
	const resumeInputRef = useRef<HTMLInputElement>(null);
	const coverLetterInputRef = useRef<HTMLInputElement>(null);
	const [resumeFileName, setResumeFileName] = useState<string>("");
	const [coverLetterFileName, setCoverLetterFileName] = useState<string>("");
	const [fileError, setFileError] = useState<string>("");
	const [isResumeDragActive, setIsResumeDragActive] = useState(false);
	const [isCoverLetterDragActive, setIsCoverLetterDragActive] = useState(false);
	const [showAIModal, setShowAIModal] = useState(false);
	const [aiCoverLetter, setAiCoverLetter] = useState<string>("");

	const selectedJob = useMemo(() => JOBS.find((job) => job.id === jobId) ?? JOBS[0], [jobId]);

	const goToApplyJob = () => {
		router.push(`/users/candidate/dashboard/apply_job?jobId=${selectedJob.id}`);
	};

	const handleSubmitApplication = () => {
		if (!resumeFileName && !coverLetterFileName) {
			setFileError("Please upload at least one file (Resume or Cover Letter) before applying.");
			return;
		}

		setFileError("");

		if (typeof window !== "undefined") {
			try {
				const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]") as unknown;
				const current = Array.isArray(parsed)
					? parsed.filter((value): value is string => typeof value === "string")
					: [];
				const next = current.includes(selectedJob.id)
					? current
					: [...current, selectedJob.id];
				window.localStorage.setItem(storageKey, JSON.stringify(next));
			} catch {
				// Keep navigation working even when storage is unavailable.
			}
		}

		router.push(`/users/candidate/dashboard/apply_job/apply_forum/apply_success?jobId=${selectedJob.id}`);
	};

	const handleResumeBrowse = () => {
		resumeInputRef.current?.click();
	};

	const handleCoverLetterBrowse = () => {
		coverLetterInputRef.current?.click();
	};

	const handleEditFiles = () => {
		if (resumeInputRef.current) {
			resumeInputRef.current.click();
			return;
		}

		coverLetterInputRef.current?.click();
	};

	const handleResumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0];
		setResumeFileName(selectedFile ? selectedFile.name : "");
		if (selectedFile) {
			setFileError("");
		}
	};

	const handleCoverLetterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0];
		setCoverLetterFileName(selectedFile ? selectedFile.name : "");
		if (selectedFile) {
			setFileError("");
		}
	};

	const handleResumeDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsResumeDragActive(true);
	};

	const handleResumeDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsResumeDragActive(false);
	};

	const handleResumeDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsResumeDragActive(false);
		const droppedFile = event.dataTransfer.files?.[0];
		if (droppedFile) {
			setResumeFileName(droppedFile.name);
			setFileError("");
		}
	};

	const handleCoverLetterDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsCoverLetterDragActive(true);
	};

	const handleCoverLetterDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsCoverLetterDragActive(false);
	};

	const handleCoverLetterDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsCoverLetterDragActive(false);
		const droppedFile = event.dataTransfer.files?.[0];
		if (droppedFile) {
			setCoverLetterFileName(droppedFile.name);
			setFileError("");
		}
	};

	return (
		<div className="fixed inset-0 z-[80] overflow-hidden [&_button:not(:disabled)]:cursor-pointer">
			<DashboardBackdrop />

			<div className="absolute inset-0 bg-[#DCE6F3]/56 backdrop-blur-xl" />

			<div className="relative z-10 mx-auto flex h-full max-w-[1220px] items-start justify-center px-4 pt-5">
				<div className="relative w-full max-w-[620px] rounded-2xl border border-[#D7DEE8] bg-[#EFF6FD] p-8 shadow-[0_18px_55px_rgba(32,51,87,0.12)]">
					<button
						onClick={goToApplyJob}
						className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md border border-[#C7CED9] bg-white text-slate-500 transition hover:bg-slate-50"
						aria-label="Close"
					>
						<X size={16} />
					</button>

					<h1 className="text-[30px] font-bold leading-tight text-slate-900">Apply for {selectedJob.title}</h1>
					<p className="mt-5 text-[15px] text-slate-600">Application Form</p>

					<div className="mt-5">
						<p className="mb-3 text-[15px] text-slate-600">Resume</p>
						<input
							ref={resumeInputRef}
							type="file"
							accept=".pdf,.doc,.docx"
							onChange={handleResumeChange}
							className="hidden"
						/>
						<div
							onDragOver={handleResumeDragOver}
							onDragLeave={handleResumeDragLeave}
							onDrop={handleResumeDrop}
							className={`flex h-[108px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-[17px] font-medium text-indigo-500 transition ${
								isResumeDragActive
									? "border-indigo-500 bg-indigo-50/70"
									: "border-[#CDD4E0] bg-white/65"
							}`}
						>
							<p className="text-slate-500">{resumeFileName || "No resume uploaded"}</p>
							<p className="text-[14px] text-slate-400">Drag &amp; Drop Resume</p>
							<button
								type="button"
								onClick={handleResumeBrowse}
								className="text-[16px] font-semibold text-indigo-600 hover:underline"
							>
								Browse CV
							</button>
						</div>
						{resumeFileName ? (
							<p className="mt-2 text-[14px] text-slate-600">Uploaded: {resumeFileName}</p>
						) : null}
					</div>

					<div className="mt-8">
						<input
							ref={coverLetterInputRef}
							type="file"
							accept=".pdf,.doc,.docx"
							onChange={handleCoverLetterChange}
							className="hidden"
						/>
						<p className="mb-3 text-[15px] text-slate-600">Cover Letter</p>
						<div className="grid h-[180px] grid-cols-2 overflow-hidden rounded-xl border border-[#C7CFDC] bg-white/60">
							<div
								onDragOver={handleCoverLetterDragOver}
								onDragLeave={handleCoverLetterDragLeave}
								onDrop={handleCoverLetterDrop}
								className={`flex cursor-pointer flex-col items-center justify-center border-r border-[#E3E7EF] px-4 text-center transition ${
									isCoverLetterDragActive ? "bg-indigo-50/60" : ""
								}`}
							>
								<Upload size={31} className="text-slate-500" />
								<p className="mt-2 text-[16px] leading-snug text-slate-600">Drag &amp; Drop Cover Letter</p>
								<p className="text-[16px] leading-snug text-slate-400">or</p>
								<button
									type="button"
									onClick={handleCoverLetterBrowse}
									className="mt-1 text-[17px] font-semibold text-indigo-600 hover:underline"
								>
									Browse
								</button>
							</div>

							<div className="flex flex-col items-center justify-center px-4 text-center">
								<Sparkles size={34} className="text-slate-400" />
								<button
    								onClick={() => setShowAIModal(true)}
    								className="mt-3 text-[18px] font-semibold text-indigo-600 hover:underline"
								>
    								Generate with AI
								</button>
							</div>
						</div>
						{coverLetterFileName ? (
    						<p className="mt-2 text-[14px] text-slate-600">Uploaded: {coverLetterFileName}</p>
						) : null}
						{aiCoverLetter && !coverLetterFileName ? (
    						<p className="mt-2 text-[14px] text-green-600 font-medium">✓ AI Cover Letter ready</p>
						) : null}
					</div>

					<div className="mt-7 flex items-center justify-between">
						<button
							onClick={handleEditFiles}
							className="h-10 min-w-[84px] cursor-pointer rounded-md border border-indigo-300 bg-white/70 px-4 text-[16px] font-medium text-indigo-600 transition hover:bg-white"
						>
							Edit
						</button>
						<button
							onClick={handleSubmitApplication}
							disabled={!resumeFileName && !coverLetterFileName}
							className="h-10 min-w-[98px] cursor-pointer rounded-md bg-indigo-600 px-5 text-[16px] font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
						>
							Apply
						</button>
					</div>
					{fileError ? <p className="mt-3 text-[13px] text-red-600">{fileError}</p> : null}
					{showAIModal && (
    					<AICoverLetterModal
        					jobTitle={selectedJob.title}
        					onDone={(text) => {
            					setAiCoverLetter(text);
            					setCoverLetterFileName("AI Generated");
        					}}
        					onClose={() => setShowAIModal(false)}
    					/>
					)}
				</div>
			</div>
		</div>
	);
}
