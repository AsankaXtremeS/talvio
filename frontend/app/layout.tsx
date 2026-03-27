import type { Metadata } from "next"
import { Roboto } from "next/font/google"
import "./globals.css"
import PageTransition from "@/components/layout/PageTransition"
import GlobalRedirectToast from "@/components/layout/GlobalRedirectToast"
import { AuthProvider } from "@/context/AuthContext"

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

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
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={roboto.className}>
        <AuthProvider>
          <GlobalRedirectToast />
          <PageTransition>
            {children}
          </PageTransition>
        </AuthProvider>
      </body>
    </html>
  )
}
