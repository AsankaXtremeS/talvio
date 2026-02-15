// components/auth/EmployerRegisterForm.tsx

"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Upload } from "lucide-react"
import Link from "next/link"

const schema = z
  .object({
    companyName: z.string().min(2, "Company name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Min 6 characters"),
    confirmPassword: z.string(),
    businessRegistration: z.any().optional(),
    rememberMe: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type FormData = z.infer<typeof schema>

export default function EmployerSignupForm() {
  const [fileName, setFileName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    
    try {
      const formData = new FormData()
      formData.append("companyName", data.companyName)
      formData.append("email", data.email)
      formData.append("password", data.password)
      formData.append("rememberMe", String(data.rememberMe || false))
      
      if (data.businessRegistration && data.businessRegistration[0]) {
        formData.append("businessRegistration", data.businessRegistration[0])
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register/employer`, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        console.log("Registration successful:", result)
        alert("Registration successful!")
        window.location.href = "/login/employer"
      } else {
        alert(result.error || "Registration failed")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {/* Company Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Company name
        </label>
        <input
          {...register("companyName")}
          placeholder="99x Technology"
          className="w-full px-4 py-2.5 text-sm text-slate-900 placeholder-gray-400 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.companyName && (
          <p className="text-red-500 text-xs mt-1">
            {errors.companyName.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="name@email.com"
          className="w-full px-4 py-2.5 text-sm text-slate-900 placeholder-gray-400 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Password
        </label>
        <input
          {...register("password")}
          type="password"
          placeholder="••••••••"
          className="w-full px-4 py-2.5 text-sm text-slate-900 placeholder-gray-400 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Confirm password
        </label>
        <input
          {...register("confirmPassword")}
          type="password"
          placeholder="••••••••"
          className="w-full px-4 py-2.5 text-sm text-slate-900 placeholder-gray-400 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Business Registration Info */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Business registration info
        </label>
        <div className="relative">
          <input
            {...register("businessRegistration")}
            type="file"
            id="fileUpload"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="fileUpload"
            className="w-full h-24 border-2 border-dashed border-blue-400 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors bg-white"
          >
            <Upload className="w-6 h-6 text-gray-400 mb-1" />
            <span className="text-sm text-blue-600">
              {fileName ? fileName : (
                <>
                  Drag <span className="underline">here</span> or <span className="underline">browse</span>
                </>
              )}
            </span>
          </label>
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            {...register("rememberMe")}
            type="checkbox"
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-slate-700">Remember me</span>
        </label>
        <Link
          href="/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Forgot password?
        </Link>
      </div>

      {/* Get Started Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 text-white font-semibold rounded-full text-base disabled:opacity-50 disabled:cursor-not-allowed "
        style={{
          background: "linear-gradient(90deg, #5F33E2 0%, #4F46E5 50%, #2563EB 100%)",
        }}
      >
        {isLoading ? "Creating account..." : "Get started"}
      </button>
    </form>
  )
}