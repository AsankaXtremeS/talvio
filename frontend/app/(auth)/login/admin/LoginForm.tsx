"use client"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth.service"
import { useAuth } from "@/context/AuthContext"
import { jwtDecode } from "jwt-decode"

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type FormData = z.infer<typeof schema>

export default function AdminLoginForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const { setUser, setAccessToken } = useAuth()
  const router = useRouter()

  const onSubmit = async (data: FormData) => {
    try {
      const { accessToken } = await authService.login(data)
      const decoded = jwtDecode<{ userId: string; role: string }>(accessToken)
      if (decoded.role !== "ADMIN") {
        setError("root", { type: "manual", message: "Access denied. Admin only." })
        return
      }
      setUser({ id: decoded.userId, role: "ADMIN", email: data.email })
      setAccessToken(accessToken)
      router.push("/users/admin")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed."
      setError("root", { type: "manual", message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errors.root && (
        <p className="text-sm text-center text-red-500">{errors.root.message}</p>
      )}

      <div>
        <label className="block mb-1 text-sm font-medium text-slate-700">Admin Email</label>
        <input
          {...register("email")}
          type="email"
          placeholder="admin@talvio.com"
          className="w-full px-4 py-2.5 text-sm text-slate-900 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-slate-700">Password</label>
        <input
          {...register("password")}
          type="password"
          placeholder="••••••••"
          className="w-full px-4 py-2.5 text-sm text-slate-900 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full text-white py-2.5 rounded-full font-medium transition disabled:opacity-50"
        style={{ background: "linear-gradient(90deg, #5F33E2 0%, #7C3AED 100%)" }}
      >
        {isSubmitting ? "Signing in..." : "Admin Login"}
      </button>
    </form>
  )
}
