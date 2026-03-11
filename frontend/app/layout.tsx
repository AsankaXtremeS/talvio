import type { Metadata } from "next"
import "./globals.css"
import PageTransition from "@/components/layout/PageTransition"
import { AuthProvider } from "@/context/AuthContext"

export const metadata: Metadata = {
  title: "Talvio - Connecting Talent with Opportunity",
  description: "Talvio is a platform that connects talented individuals with job opportunities, internships, and projects. We aim to empower the next generation of professionals by providing a space for them to showcase their skills and connect with potential employers.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <PageTransition>
            {children}
          </PageTransition>
        </AuthProvider>
      </body>
    </html>
  )
}
