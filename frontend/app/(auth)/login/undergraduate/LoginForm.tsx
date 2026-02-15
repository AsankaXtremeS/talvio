"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormData = z.infer<typeof schema>

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: LoginFormData) => {
    console.log(data)
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="name@email.com"
          className="w-full px-4 py-2.5 text-sm text-slate-900 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Password
        </label>
        <input
          {...register("password")}
          type="password"
          placeholder="••••••••"
          className="w-full px-4 py-2.5 text-sm text-slate-900 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="w-4 h-4" />
          <span className="text-slate-600">Remember me</span>
        </label>

        <a href="#" className="text-indigo-600 hover:text-indigo-700">
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full text-white py-2.5 rounded-full font-medium transition disabled:opacity-50"
        style={{
          background:
            "linear-gradient(90deg, #5F33E2 0%, #2563EB 60%, #2563EB 100%)",
        }}
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </button>

    </form>
  )
}
