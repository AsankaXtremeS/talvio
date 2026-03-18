"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

type Role = "STUDENT" | "PROFESSIONAL" | "EMPLOYER" | "ADMIN"

export default function OAuthCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { setAccessToken, setUser } = useAuth()

  useEffect(() => {
    const accessToken = searchParams.get("accessToken")
    const role = searchParams.get("role") as Role | null
    const email = searchParams.get("email")

    if (!accessToken || !role || !email) {
      router.replace("/login")
      return
    }

    if (role !== "STUDENT" && role !== "PROFESSIONAL") {
      router.replace("/login")
      return
    }

    setAccessToken(accessToken)
    setUser({ id: "oauth", role, email })
    localStorage.setItem("accessToken", accessToken)

    if (role === "STUDENT") {
      router.replace("/users/undergraduate")
      return
    }

    router.replace("/users/professional")
  }, [router, searchParams, setAccessToken, setUser])

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-purple-50 to-blue-100">
      <p className="text-sm text-slate-700">Completing sign up...</p>
    </div>
  )
}
