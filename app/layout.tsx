import type React from "react"
import type { Metadata } from "next"
import { GeistSans, GeistMono } from "geist/font"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import "./globals.css"
import { Abel as V0_Font_Abel } from "next/font/google"

const geistSans = GeistSans
const geistMono = GeistMono
const _abel = V0_Font_Abel({ subsets: ["latin"], weight: ["400"], variable: "--v0-font-abel" })

export const metadata: Metadata = {
  title: "VoiceCart - Voice-Enabled Retail App",
  description: "Shop with your voice using AI-powered natural language processing",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${_abel.variable}`}>
      <body className="font-sans">
        <Suspense fallback={null}>
          {children}
          <Toaster />
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
