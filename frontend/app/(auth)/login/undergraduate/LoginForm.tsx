"use client"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth.service";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { getRoleHomeRoute } from "@/lib/roleRoutes";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormData = z.infer<typeof schema>

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
  })
  const { setUser, setAccessToken } = useAuth();
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const { user, accessToken, refreshToken } = await authService.login(data);
      if (user.role !== 'STUDENT') {
        setError('root', { type: 'manual', message: 'Access denied. This login is for students only.' });
        return;
      }
      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      setUser(user);
      setAccessToken("cookie-session");
      router.push(getRoleHomeRoute(user.role, user.id));
    } catch (error: unknown) {
      setError('root', {
        type: 'manual',
        message: error instanceof Error ? error.message : 'Login failed. Check your credentials.',
      });
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {errors.root && (
          <p className="text-sm text-center text-red-500">{errors.root.message}</p>
        )}

        <div>
          <label className="block mb-1 text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="name@email.com"
            className="w-full px-4 py-2.5 text-sm text-slate-900 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-slate-700">
            Password
          </label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 pr-11 text-sm text-slate-900 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex justify-center text-sm">
          <p className="text-sm text-indigo-600 cursor-pointer" onClick={() => router.push("/forgot-password")}>
            Forgot Password?
          </p>
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
          {isSubmitting ? "Signing in..." : "Login"}
        </button>

      </form>

    </>
  )
}
