// components/auth/undergraduate/RegisterForm.tsx

"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth.service"

const schema = z
  .object({
    firstName: z.string().min(2, "Required"),
    lastName: z.string().min(2, "Required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Min 6 characters"),
    confirmPassword: z.string(),
    rememberMe: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type FormData = z.infer<typeof schema>

function getStrength(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const strengthMeta = [
  { label: "",        color: "",              text: ""               },
  { label: "Weak",   color: "bg-red-400",    text: "text-red-400"   },
  { label: "Fair",   color: "bg-orange-400", text: "text-orange-400"},
  { label: "Good",   color: "bg-yellow-400", text: "text-yellow-500"},
  { label: "Strong", color: "bg-green-500",  text: "text-green-500" },
]

const inputClass =
  "w-full px-3 py-1.5 text-sm text-slate-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"

export default function UndergraduateRegisterForm() {
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwValue, setPwValue] = useState("")
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await authService.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: 'STUDENT',
      })
      router.push('/login/undergraduate')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed. Please try again.'
      console.error('Registration failed:', message)
      alert(message)
    }
  }

  const strength = getStrength(pwValue)
  const { label, color, text } = strengthMeta[strength]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">

      {/* Name Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block mb-1 text-xs font-medium text-slate-700">First name</label>
          <input
            {...register("firstName")}
            placeholder="John"
            className={inputClass}
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-0.5">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 text-xs font-medium text-slate-700">Last name</label>
          <input
            {...register("lastName")}
            placeholder="Doe"
            className={inputClass}
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-0.5">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block mb-1 text-xs font-medium text-slate-700">Email</label>
        <input
          {...register("email")}
          type="email"
          placeholder="you@university.edu"
          className={inputClass}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-0.5">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block mb-1 text-xs font-medium text-slate-700">Password</label>
        <div className="relative">
          <input
            {...register("password", { onChange: (e) => setPwValue(e.target.value) })}
            type={showPw ? "text" : "password"}
            placeholder="••••••••"
            className={`${inputClass} pr-9`}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-xs mt-0.5">{errors.password.message}</p>
        )}
        {/* Strength meter */}
        {pwValue && (
          <div className="mt-1.5">
            <div className="flex gap-1 mb-0.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? color : "bg-gray-200"}`}
                />
              ))}
            </div>
            <p className={`text-xs font-medium ${text}`}>{label}</p>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block mb-1 text-xs font-medium text-slate-700">Confirm password</label>
        <div className="relative">
          <input
            {...register("confirmPassword")}
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••"
            className={`${inputClass} pr-9`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-0.5">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center gap-2">
        <input
          {...register("rememberMe")}
          type="checkbox"
          id="rememberMe"
          className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="rememberMe" className="text-xs cursor-pointer text-slate-700">
          Remember me
        </label>
      </div>

      {/* Get Started Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-shadow text-sm mt-3 disabled:opacity-50"
        style={{ background: "linear-gradient(90deg, #5F33E2 0%, #4F46E5 50%, #2563EB 100%)" }}
      >
        {isSubmitting ? "Creating account..." : "Get started"}
      </button>

      {/* Divider */}
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 text-gray-500 bg-white">or</span>
        </div>
      </div>

      {/* LinkedIn Button */}
      <button
        type="button"
        className="flex items-center justify-center w-full gap-2 px-4 py-2 transition-colors border border-gray-300 rounded-full hover:bg-gray-50"
      >
        <Image src="/images/linkedin.svg" alt="LinkedIn" width={16} height={16} />
        <span className="text-xs font-medium text-slate-700">Sign up with LinkedIn</span>
      </button>

      {/* Google Button */}
      <button
        type="button"
        className="flex items-center justify-center w-full gap-2 px-4 py-2 transition-colors border border-gray-300 rounded-full hover:bg-gray-50"
      >
        <Image src="/images/google.svg" alt="Google" width={16} height={16} />
        <span className="text-xs font-medium text-slate-700">Sign up with Google</span>
      </button>

    </form>
  )
}