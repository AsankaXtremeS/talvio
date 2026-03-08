import Link from "next/link"
import { X, ShieldCheck } from "lucide-react"
import AdminLoginForm from "./LoginForm"

export default function AdminLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-6" style={{ backgroundColor: "#F3F0FF" }}>
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex h-[520px]">

        {/* Left Panel */}
        <div
          className="flex flex-col justify-between w-1/2 p-12"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(109,40,217,0.1) 100%)",
          }}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-violet-700">Talvio</h1>
            <p className="mt-1 text-sm text-slate-600">Admin Control Panel</p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-violet-100 rounded-full">
                <ShieldCheck className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Secure Admin Access</p>
                <p className="text-xs text-slate-500">Only authorized administrators</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Manage your platform</h2>
            <p className="text-sm text-slate-600">Review and approve employer registrations, manage users, and oversee platform activity.</p>
          </div>

          <p className="text-xs text-slate-400">Talvio Admin Panel &copy; {new Date().getFullYear()}</p>
        </div>

        {/* Right Panel */}
        <div className="relative flex flex-col justify-center w-1/2 p-12">
          <Link href="/">
            <button className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-1">Admin Sign In</h2>
            <p className="text-sm text-slate-500">Restricted access — administrators only</p>
          </div>

          <AdminLoginForm />
        </div>
      </div>
    </div>
  )
}
