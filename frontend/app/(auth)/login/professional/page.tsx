import Image from "next/image"
import Link from "next/link"
import { X, Briefcase, TrendingUp, ShieldCheck } from "lucide-react"
import LoginForm from "../undergraduate/LoginForm"

export default function ProfessionalLoginPage() {
  return (
    <div
  className="flex items-center justify-center min-h-screen p-4"
  style={{ backgroundColor: "#E9F3FD" }}
>

      <div className="flex w-full max-w-6xl overflow-hidden bg-white shadow-lg h-[600px] rounded-3xl">
        {/* Left Panel */}
        <div
          className="flex flex-col justify-between w-1/2 p-12 border-r"
          style={{
            background: `
      linear-gradient(
        135deg,
        rgba(233, 212, 255, 0.4) 0%,
        rgba(190, 219, 255, 0.3) 50%,
        rgba(162, 244, 253, 0.4) 100%
      )
    `,
          }}
        >
          {/* Brand */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-violet-700">
              Talvio
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Career & Opportunity Platform
            </p>
          </div>

          {/* Main Message */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-slate-800">
              Take the next step in your career.
            </h2>

            <p className="mb-8 text-sm leading-relaxed text-slate-600">
              Discover full-time opportunities, connect with verified employers,
              and manage your job applications in one place.
            </p>

            <div className="space-y-4">
              <Feature
                icon={<Briefcase className="w-4 h-4 text-indigo-600" />}
                text="Full-time job opportunities"
              />
              <Feature
                icon={<TrendingUp className="w-4 h-4 text-indigo-600" />}
                text="Career growth insights"
              />
              <Feature
                icon={<ShieldCheck className="w-4 h-4 text-indigo-600" />}
                text="Verified companies"
              />
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Built for professionals seeking new career opportunities.
          </p>
        </div>

        {/* Right Panel */}
        <div className="relative w-1/2 p-10 overflow-y-auto">
          <Link href="/login"> 
          <button className="absolute text-gray-400 top-4 right-4 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
          </Link>

          <div className="max-w-md mx-auto">
            <h2 className="mb-1 text-2xl font-bold text-gray-900">
              Professional Login
            </h2>
            <p className="mb-6 text-sm text-gray-500">
              Access your job dashboard
            </p>

            <LoginForm />

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 tracking-wide text-gray-400 uppercase bg-white">
                  Or continue with
                </span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              <button className="flex items-center justify-center w-full gap-2 px-4 py-2 transition-colors border border-gray-300 rounded-full hover:bg-gray-50">
                <Image
                  src="/images/linkedin.svg"
                  alt="LinkedIn"
                  width={18}
                  height={18}
                />
                <span className="text-sm font-medium text-gray-700">
                  LinkedIn
                </span>
              </button>

              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
                <Image
                  src="/images/google.svg"
                  alt="Google"
                  width={18}
                  height={18}
                />
                <span className="text-sm font-medium text-gray-700">
                  Google
                </span>
              </button>
            </div>

            <p className="mt-5 text-sm text-center text-gray-600">
              Don&apos;t have a professional account?{" "}
              <Link
                href="/register/professional"
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                Create professional account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center bg-white border rounded-lg shadow-sm w-9 h-9">
        {icon}
      </div>
      <span className="text-sm text-slate-700">{text}</span>
    </div>
  )
}
