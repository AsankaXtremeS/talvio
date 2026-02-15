import Link from "next/link"
import { X, Building2, Users, ShieldCheck } from "lucide-react"
import LoginForm from "./LoginForm"

export default function CompanyLoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: "#E9F3FD" }}
    >
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden flex" style={{ height: '620px' }}>

        {/* Left Panel */}
        <div
          className="w-1/2 p-12 flex flex-col justify-between"
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
            <h1 className="text-3xl font-bold text-violet-700 tracking-tight">
              Talvio
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Employer & Hiring Platform
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              Hire with confidence.
            </h2>

            <p className="text-sm text-slate-700 mb-8 leading-relaxed max-w-md">
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
        <div className="w-1/2 p-10 relative bg-white">

          <button className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>

          <div className="max-w-md mx-auto mt-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-1">
              Company Login
            </h2>

            <p className="text-sm text-slate-500 mb-6">
              Access your hiring dashboard
            </p>

            <LoginForm />

            <p className="text-center text-sm text-gray-600 mt-8">
              Don&apos;t have a company account?{" "}
              <Link
                href="/register/employer"
                className="text-indigo-600 font-medium hover:text-indigo-700"
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
      <div className="w-9 h-9 bg-white border rounded-lg flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <span className="text-sm text-slate-800">{text}</span>
    </div>
  )
}
