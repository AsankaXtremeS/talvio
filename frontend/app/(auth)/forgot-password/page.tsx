"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Mail, ArrowLeft, Send } from "lucide-react"
import { authService } from "@/lib/auth.service"

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [sentTo, setSentTo] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await authService.forgotPassword(data.email)
      setSentTo(data.email)
      setSubmitted(true)
    } catch {
      setSentTo(data.email)
      setSubmitted(true) // show success regardless to prevent email enumeration
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-6" style={{ backgroundColor: "#E9F3FD" }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-violet-700">Talvio</h1>
          <p className="text-sm text-slate-500 mt-0.5">Employer & Hiring Platform</p>
        </div>

        <div className="p-10 bg-white shadow-xl rounded-2xl">
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center mx-auto rounded-full w-14 h-14 bg-indigo-50">
                <Mail className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Check your email</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  We sent a reset link to{" "}
                  <span className="font-medium text-slate-700">{sentTo}</span>
                </p>
              </div>
              <p className="text-sm text-slate-400">
                Didn&apos;t receive it?{" "}
                <button
                  onClick={() => setSubmitted(false)}
                  className="font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Resend email
                </button>
              </p>
              <Link href="/login">
                <button
                  className="w-full mt-2 text-white py-2.5 rounded-full font-medium transition disabled:opacity-50"
                  style={{ background: "linear-gradient(90deg, #5F33E2 0%, #2563EB 60%, #2563EB 100%)" }}
                >
                  Back to Login
                </button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-slate-900">Forgot password?</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-700">
                    Email address
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 text-sm text-slate-900 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 text-white py-2.5 rounded-full font-medium transition disabled:opacity-50"
                  style={{ background: "linear-gradient(90deg, #5F33E2 0%, #2563EB 60%, #2563EB 100%)" }}
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Sending..." : "Send reset link"}
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