import Image from "next/image"
import Link from "next/link"
import { X, Sparkles, Target, ShieldCheck } from "lucide-react"
import LoginForm from "./LoginForm"

export default function UndergraduateLoginPage() {
  return (
    <div
      className="flex items-center justify-center min-h-screen p-4 sm:p-6"
      style={{ backgroundColor: "#E9F3FD" }}
    >
      <div className="w-full max-w-6xl min-h-fit lg:h-[600px] bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col lg:flex-row">
        {/* Left Panel */}
        <div
          className="flex flex-col justify-between w-full lg:w-1/2 p-6 sm:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r"
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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-violet-700">
              Talvio
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Internship & Early Career Platform
            </p>
          </div>

          {/* Main Message */}
          <div className="my-6 lg:my-0">
            <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-slate-800">
              Start building your professional journey.
            </h2>

            <p className="mb-6 sm:mb-8 text-xs sm:text-sm leading-relaxed text-slate-600">
              Access verified internships, create a strong profile, and connect
              with companies looking for talented students.
            </p>

            <div className="space-y-3 sm:space-y-4">
              <Feature
                icon={<Sparkles className="w-4 h-4 text-indigo-600" />}
                text="AI-powered resume tools"
              />
              <Feature
                icon={<Target className="w-4 h-4 text-indigo-600" />}
                text="Smart internship matching"
              />
              <Feature
                icon={<ShieldCheck className="w-4 h-4 text-indigo-600" />}
                text="Verified hiring companies"
              />
            </div>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-400">
            Built for undergraduate students seeking real-world experience.
          </p>
        </div>

        {/* Right Panel */}
        <div className="relative w-full lg:w-1/2 p-6 sm:p-10 overflow-y-auto flex flex-col justify-center">
         <Link href="/login"> 
          <button className="absolute text-gray-400 top-4 right-4 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
          </Link>

          <div className="max-w-md w-full mx-auto">
            <h2 className="mb-1 text-xl sm:text-2xl font-bold text-gray-900">
              Student Login
            </h2>
            <p className="mb-5 sm:mb-6 text-xs sm:text-sm text-gray-500">
              Access your internship dashboard
            </p>

            <LoginForm />

            {/* Divider */}
            <div className="relative my-5 sm:my-6">
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
              <a
                href="/api/auth/oauth/google?role=STUDENT"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                <Image
                  src="/images/google.svg"
                  alt="Google"
                  width={18}
                  height={18}
                />
                <span className="text-sm font-medium text-gray-700">
                  Continue with Google
                </span>
              </a>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-center text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register/undergraduate"
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                Create student account
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
