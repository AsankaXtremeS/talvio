/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react"
import { authService } from "@/lib/auth.service"

const schema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
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
  { label: "", color: "bg-gray-200" },
  { label: "Weak", color: "bg-red-400" },
  { label: "Fair", color: "bg-orange-400" },
  { label: "Good", color: "bg-yellow-400" },
  { label: "Strong", color: "bg-green-500" },
]

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [success, setSuccess] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwValue, setPwValue] = useState("")
  const [serverError, setServerError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      setServerError("")
      await authService.resetPassword(token ?? '', data.password)
      setSuccess(true)
    } catch (error: any) {
      setServerError(error.message || "This reset link is invalid or has expired. Please request a new one.")
    }
  }

  const strength = getStrength(pwValue)
  const { label, color } = strengthMeta[strength]

  return (
    <div className="flex items-center justify-center min-h-screen p-6" style={{ backgroundColor: "#E9F3FD" }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-violet-700">Talvio</h1>
          <p className="text-sm text-slate-500 mt-0.5">Employer & Hiring Platform</p>
        </div>

        <div className="p-10 bg-white shadow-xl rounded-2xl">
          {success ? (
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center mx-auto rounded-full w-14 h-14 bg-green-50">
                <CheckCircle className="text-green-500 w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Password updated!</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Your password has been reset successfully. You can now log in.
                </p>
              </div>
              <Link href="/login">
                <button
                  className="w-full mt-2 text-white py-2.5 rounded-full font-medium transition"
                  style={{ background: "linear-gradient(90deg, #5F33E2 0%, #2563EB 60%, #2563EB 100%)" }}
                >
                  Back to Login
                </button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-slate-900">Reset password</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choose a strong new password for your account.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-700">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      {...register("password", { onChange: (e) => setPwValue(e.target.value) })}
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pr-11 text-sm text-slate-900 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                  )}
                  {/* Strength meter */}
                  {pwValue && (
                    <div className="px-1 mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? color : "bg-gray-200"}`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${
                        strength === 1 ? "text-red-400"
                        : strength === 2 ? "text-orange-400"
                        : strength === 3 ? "text-yellow-500"
                        : strength === 4 ? "text-green-500"
                        : ""
                      }`}>{label}</p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-700">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      {...register("confirmPassword")}
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pr-11 text-sm text-slate-900 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {serverError && (
                  <p className="text-sm text-center text-red-500">{serverError}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-white py-2.5 rounded-full font-medium transition disabled:opacity-50"
                  style={{ background: "linear-gradient(90deg, #5F33E2 0%, #2563EB 60%, #2563EB 100%)" }}
                >
                  {isSubmitting ? "Resetting..." : "Reset password"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}