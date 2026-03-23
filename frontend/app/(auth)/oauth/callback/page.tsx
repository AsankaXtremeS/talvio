"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { getRoleHomeRoute } from "@/lib/roleRoutes"
import { authService } from "@/lib/auth.service"

type Role = "STUDENT" | "PROFESSIONAL" | "EMPLOYER" | "ADMIN"

type SessionUser = {
  id: string
  role: Role
  email: string
  firstName?: string | null
  lastName?: string | null
}

export default function OAuthCallbackPage() {
  const router = useRouter()
  const { setAccessToken, setUser } = useAuth()

  useEffect(() => {
    const completeOAuthLogin = async () => {
      try {
        const { user } = (await authService.me()) as { user?: SessionUser }
        if (!user) {
          router.replace("/login")
          return
        }

        if (user.role !== "STUDENT" && user.role !== "PROFESSIONAL") {
          router.replace("/login")
          return
        }

        setAccessToken("cookie-session")
        setUser(user)
        router.replace(getRoleHomeRoute(user.role, user.id))
      } catch {
        router.replace("/login")
      }
    }

    completeOAuthLogin()
  }, [router, setAccessToken, setUser])

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-purple-50 to-blue-100">
      <p className="text-sm text-slate-700">Completing sign up...</p>
    </div>
  )
}
