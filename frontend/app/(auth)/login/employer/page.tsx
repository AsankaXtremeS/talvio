import Link from "next/link"
import { X, Building2, Users, ShieldCheck } from "lucide-react"
import LoginForm from "./LoginForm"

export default function CompanyLoginPage() {
  return (
    <div
      className="flex items-center justify-center min-h-screen p-6"
      style={{ backgroundColor: "#E9F3FD" }}
    >
      <div className="w-full max-w-6xl h-[620px] bg-white rounded-2xl shadow-xl overflow-hidden flex">

        {/* Left Panel */}
        <div
          className="flex flex-col justify-between w-1/2 p-12"
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
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-violet-700">
              Talvio
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Employer & Hiring Platform
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              Hire with confidence.
            </h2>

            <p className="max-w-md mb-8 text-sm leading-relaxed text-slate-700">
              Connect with talented students and professionals, manage applications,
              and streamline your hiring process through Talvio.
            </p>

            <div className="space-y-4">
              <Feature icon={<Building2 className="w-4 h-4 text-indigo-600" />} text="Post verified job listings" />
              <Feature icon={<Users className="w-4 h-4 text-indigo-600" />} text="Access qualified candidates" />
              <Feature icon={<ShieldCheck className="w-4 h-4 text-indigo-600" />} text="Secure & trusted platform" />
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Built for companies hiring top emerging talent.
          </p>
        </div>

        {/* Right Panel */}
        <div className="relative w-1/2 p-10 bg-white">
          <Link href="/login"> 
          <button className="absolute text-gray-400 top-6 right-6 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
          </Link>

          <div className="max-w-md mx-auto mt-6">
            <h2 className="mb-1 text-2xl font-semibold text-slate-900">
              Company Login
            </h2>

            <p className="mb-6 text-sm text-slate-500">
              Access your hiring dashboard
            </p>

            <LoginForm />

            <p className="mt-8 text-sm text-center text-gray-600">
              Don&apos;t have a company account?{" "}
              <Link
                href="/register/employer"
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center bg-white border rounded-lg shadow-sm w-9 h-9">
        {icon}
      </div>
      <span className="text-sm text-slate-800">{text}</span>
    </div>
  )
}
