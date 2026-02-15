// components/auth/RegisterForm.tsx

"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"

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

export default function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    console.log(data)
    // Handle form submission here
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">

      {/* Name Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            First name
          </label>
          <input
            {...register("firstName")}
            placeholder="John"
            className="w-full px-3 py-1.5 text-sm text-slate-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-0.5">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Last name
          </label>
          <input
            {...register("lastName")}
            placeholder="Cena"
            className="w-full px-3 py-1.5 text-sm text-slate-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-0.5">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="name@email.com"
          className="w-full px-3 py-1.5 text-sm text-slate-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-0.5">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Password
        </label>
        <input
          {...register("password")}
          type="password"
          placeholder="••••••••"
          className="w-full px-3 py-1.5 text-sm text-slate-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-0.5">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Confirm password
        </label>
        <input
          {...register("confirmPassword")}
          type="password"
          placeholder="••••••••"
          className="w-full px-3 py-1.5 text-sm text-slate-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-0.5">
            {errors.confirmPassword.message}
          </p>
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
        <label htmlFor="rememberMe" className="text-xs text-slate-700 cursor-pointer">
          Remember me
        </label>
      </div>

      {/* Get Started Button */}
      <button
        type="submit"
        className="w-full py-2.5 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-shadow text-sm mt-3"
        style={{
          background: "linear-gradient(90deg, #5F33E2 0%, #4F46E5 50%, #2563EB 100%)",
        }}
      >
        Get started
      </button>

      {/* Divider */}
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-gray-500">or</span>
        </div>
      </div>

      {/* LinkedIn Button */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
      >
        <Image
          src="/images/linkedin.svg"
          alt="LinkedIn"
          width={16}
          height={16}
        />
        <span className="text-xs font-medium text-slate-700">
          Sign up with LinkedIn
        </span>
      </button>

      {/* Google Button */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
      >
        <Image
          src="/images/google.svg"
          alt="Google"
          width={16}
          height={16}
        />
        <span className="text-xs font-medium text-slate-700">
          Sign up with Google
        </span>
      </button>
    </form>
  )
}