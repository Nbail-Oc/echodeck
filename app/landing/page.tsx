import type { Metadata } from "next"
import { LandingHero } from "@/components/landing-hero"

export const metadata: Metadata = {
  title: "EchoDeck — Interactive Soundboard for Streamers",
  description: "Press a sound. Make it yours. Bring it back. Interactive Twitch soundboards, viewer triggers, and voice mimic challenges.",
  openGraph: {
    title: "EchoDeck — Interactive Soundboard for Streamers",
    description: "Press a sound. Make it yours. Bring it back. Interactive Twitch soundboards, viewer triggers, and voice mimic challenges.",
    siteName: "EchoDeck",
    images: [
      {
        url: "/favicon.png",
        width: 512,
        height: 512,
        alt: "EchoDeck Logo",
      },
    ],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
}

export default function LandingPage() {
  return <LandingHero />
}
