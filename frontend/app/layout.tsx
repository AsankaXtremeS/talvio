import type { Metadata } from "next"
import { Roboto } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import PageTransition from "@/components/layout/PageTransition"
import GlobalRedirectToast from "@/components/layout/GlobalRedirectToast"
import { AuthProvider } from "@/context/AuthContext"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";

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
        <NextSSRPlugin
          /**
           * The `extractRouterConfig` will extract **only** the route configs
           * from the router to prevent additional information from being
           * leaked to the client. The data passed to the client is the same
           * as if you were to fetch `/api/uploadthing` directly.
           */
          routerConfig={extractRouterConfig(ourFileRouter)}
        />
        <Script id="performance-method-polyfill" strategy="beforeInteractive">
          {`(function () {
  if (typeof window === "undefined") return;
  var p = window.performance;
  if (!p) return;

  var proto = Object.getPrototypeOf(p);

  function ensureMethod(name, fallback) {
    if (typeof p[name] === "function") return;

    // Try defining directly on the performance object first.
    try {
      Object.defineProperty(p, name, {
        configurable: true,
        writable: true,
        value: fallback,
      });
      return;
    } catch (_err) {
      // Ignore and fallback to prototype patching below.
    }

    // Some runtimes disallow own-property assignment on Performance.
    if (proto && typeof proto[name] !== "function") {
      try {
        Object.defineProperty(proto, name, {
          configurable: true,
          writable: true,
          value: fallback,
        });
      } catch (_err2) {
        // Ignore if both assignment and prototype patching are blocked.
      }
    }
  }

  ensureMethod("clearMarks", function () {});
  ensureMethod("clearMeasures", function () {});
  ensureMethod("mark", function () {});
  ensureMethod("measure", function () { return undefined; });
  ensureMethod("getEntriesByName", function () { return []; });
})();`}
        </Script>
        <QueryProvider>
          <AuthProvider>
            <GlobalRedirectToast />
            <PageTransition>
              {children}
            </PageTransition>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
