import { Geist, Geist_Mono } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AgentationProvider } from "@/components/agentation-provider"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "EchoDeck — Interactive Soundboard for Streamers",
  description: "Press a sound. Make it yours. Bring it back. Interactive Twitch soundboards, viewer triggers, and voice mimic challenges.",
  openGraph: {
    title: "EchoDeck — Interactive Soundboard for Streamers",
    description: "Next-gen Twitch soundboard, voice mimics, and streamer audio tools.",
    siteName: "EchoDeck",
    images: [{ url: "/favicon.png", width: 512, height: 512, alt: "EchoDeck Logo" }],
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: "/favicon.png",
  },
}

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
        <AgentationProvider />
      </body>
    </html>
  )
}
