import Link from "next/link";
import { GraduationCap, User, Building2, X } from 'lucide-react';
import { Button } from '../../../components/ui/SignButton';

export default function RegisterPage() {
    return (
         <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
      <div className="w-full max-w-5xl h-[600px] bg-white rounded-3xl shadow-2xl p-12 relative">
        {/* Close button */}
          <Link href="/">
        <button className="absolute text-gray-400 top-6 right-6 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
        </Link>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-2xl font-bold text-violet-700">Talvio</h1>
          <h2 className="mb-4 text-5xl font-bold text-gray-900">Sign Up</h2>
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Undergraduate Card */}
          <div className="flex flex-col items-center p-8 text-center transition-all border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-lg">
            <div className="flex items-center justify-center w-20 h-20 mb-6 bg-blue-100 rounded-full">
              <GraduationCap className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900">Undergraduate</h3>
            <p className="flex-grow mb-8 text-sm text-gray-600">
              Kick-start your career with smart job matching
            </p>
            <Link href="/register/undergraduate" className="w-full">
              <Button>Register</Button>
            </Link>
          </div>

          {/* Professional Card */}
          <div className="flex flex-col items-center p-8 text-center transition-all border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-lg">
            <div className="flex items-center justify-center w-20 h-20 mb-6 bg-blue-100 rounded-full">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900">Professional</h3>
            <p className="flex-grow mb-8 text-sm text-gray-600">
              Find roles that match your skills instantly
            </p>
            <Link href="/register/professional" className="w-full">
              <Button>Register</Button>
            </Link>
          </div>

          {/* Employer Card */}
          <div className="flex flex-col items-center p-8 text-center transition-all border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-lg">
            <div className="flex items-center justify-center w-20 h-20 mb-6 bg-blue-100 rounded-full">
              <Building2 className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900">Employer</h3>
            <p className="flex-grow mb-8 text-sm text-gray-600">
              Hire verified talent faster with AI
            </p>
            <Link href="/register/employer" className="w-full">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
    )
}