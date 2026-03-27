"use client"

import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { usePathname } from "next/navigation"

export default function PageTransition({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password") || pathname.startsWith("/reset-password")

  if (isAuthPage || prefersReducedMotion) {
    return <div className="relative min-h-screen bg-[#E9F3FD]">{children}</div>
  }

  return (
    <div className="relative min-h-screen bg-[#E9F3FD]">
      <AnimatePresence mode="sync">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="absolute inset-0"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
