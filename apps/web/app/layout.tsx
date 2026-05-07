import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"
import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://packdaddy.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "packdaddy — audit your deps, no bloat",
    template: "%s | packdaddy",
  },
  description:
    "Zero-dependency CLI to find unused, outdated, vulnerable, and heavy packages. Works with npm, pnpm, yarn, and bun. Run with npx packdaddy.",
  keywords: [
    "packdaddy",
    "npm audit",
    "unused dependencies",
    "outdated packages",
    "dependency audit",
    "cli",
    "devtools",
    "node modules",
    "security",
    "cve",
    "pnpm",
    "yarn",
    "bun",
  ],
  authors: [{ name: "01shrvan", url: "https://github.com/01shrvan" }],
  creator: "01shrvan",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "packdaddy — audit your deps, no bloat",
    description:
      "Zero-dependency CLI to find unused, outdated, vulnerable, and heavy packages. Works with npm, pnpm, yarn, and bun.",
    siteName: "packdaddy",
    type: "website",
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "packdaddy — audit your deps, no bloat",
    description:
      "Zero-dependency CLI to find unused, outdated, vulnerable, and heavy packages. Works with npm, pnpm, yarn, and bun.",
    creator: "@01shrvan",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={mono.variable}>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
