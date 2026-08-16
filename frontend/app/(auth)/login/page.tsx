// app/(auth)/login/page.tsx

import Link from 'next/link';
import { GraduationCap, User, Building2, X } from 'lucide-react';
import { Button } from '../../../components/ui/SignButton';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 bg-linear-to-br from-blue-50 via-purple-50 to-blue-100">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl p-6 sm:p-10 md:p-12 relative">
        {/* Close button */}
        <Link href="/"> 
          <button className="absolute text-gray-400 top-4 sm:top-6 right-4 sm:right-6 hover:text-gray-600">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </Link>

        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="mb-2 sm:mb-4 text-xl sm:text-2xl font-bold text-violet-700">Talvio</h1>
          <h2 className="mb-2 sm:mb-4 text-3xl sm:text-5xl font-bold text-gray-900">Sign In</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Dont have an account?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700">
              Sign up
            </Link>
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3 mb-6 sm:mb-8">
          {/* Undergraduate Card */}
          <div className="flex flex-col items-center p-6 sm:p-8 text-center transition-all border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-lg">
            <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 bg-blue-100 rounded-full">
              <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
            </div>
            <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-semibold text-gray-900">Undergraduate</h3>
            <p className="grow mb-6 sm:mb-8 text-xs sm:text-sm text-gray-600">
              Kick-start your career with smart job matching
            </p>
            <Link href="/login/undergraduate" className="w-full">
              <Button>Sign in</Button>
            </Link>
          </div>

          {/* Professional Card */}
          <div className="flex flex-col items-center p-6 sm:p-8 text-center transition-all border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-lg">
            <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 bg-blue-100 rounded-full">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
            </div>
            <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-semibold text-gray-900">Professional</h3>
            <p className="grow mb-6 sm:mb-8 text-xs sm:text-sm text-gray-600">
              Find roles that match your skills instantly
            </p>
            <Link href="/login/professional" className="w-full">
              <Button>Sign in</Button>
            </Link>
          </div>

          {/* Employer Card */}
          <div className="flex flex-col items-center p-6 sm:p-8 text-center transition-all border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-lg">
            <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 bg-blue-100 rounded-full">
              <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
            </div>
            <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-semibold text-gray-900">Employer</h3>
            <p className="grow mb-6 sm:mb-8 text-xs sm:text-sm text-gray-600">
              Hire verified talent faster with AI
            </p>
            <Link href="/login/employer" className="w-full">
              <Button>Sign in</Button>
            </Link>
          </div>
        </div>

        {/* Admin Access Footer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-center">
          <Link
            href="/login/admin"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-500 hover:text-violet-700 bg-slate-50 hover:bg-violet-50 rounded-full border border-slate-200 hover:border-violet-200 transition-all duration-200"
          >
            Administrator Portal
          </Link>
        </div>
      </div>
    </div>
  );
}