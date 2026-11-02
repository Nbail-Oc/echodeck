"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

export function LandingHero() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeBuzzer, setActiveBuzzer] = useState<number | null>(null)
  const barRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Video autoplay helper
    const v = videoRef.current
    if (!v) return

    v.muted = true
    const play = () => {
      if (v.paused) {
        const p = v.play()
        if (p && p.catch) {
          p.catch(() => {})
        }
      }
    }

    play()
    v.addEventListener("canplay", play)

    const handleVisibility = () => {
      if (!document.hidden) play()
    }
    document.addEventListener("visibilitychange", handleVisibility)

    const interactionEvents = ["pointerdown", "touchstart", "scroll"] as const
    interactionEvents.forEach((evt) => {
      window.addEventListener(evt, play, { once: true, passive: true })
    })

    return () => {
      v.removeEventListener("canplay", play)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [])

  useEffect(() => {
    // Mobile menu outside click & Escape
    const handleClickOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("click", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const sampleBuzzers = [
    { key: "1", name: "Airhorn", color: "#f43f5e" },
    { key: "2", name: "Bruh", color: "#a855f7" },
    { key: "3", name: "Victory", color: "#3b82f6" },
    { key: "4", name: "Damage", color: "#eab308" },
    { key: "5", name: "Sitcom", color: "#10b981" },
  ]

  return (
    <div className="relative min-h-screen w-full bg-[#050507] text-white selection:bg-purple-500/30 overflow-x-hidden font-sans">
      {/* ─── FLOATING ISLAND NAVBAR ─── */}
      <header
        ref={barRef}
        className="fixed top-6 inset-x-0 mx-auto w-[92%] max-w-5xl z-50 transition-all duration-300"
      >
        <div className="flex items-center justify-between px-5 py-3 rounded-full bg-[#0d0d12]/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.15)]">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative size-8 rounded-full bg-white/5 border border-white/15 flex items-center justify-center transition-transform group-hover:scale-105">
              <svg className="w-5 h-4 overflow-visible" viewBox="0 0 27 17" fill="none">
                <ellipse cx="13.25" cy="8.4" rx="13.2" ry="2.9" transform="rotate(-25 13.25 8.4)" stroke="#fff" strokeWidth="1.25" opacity="0.6"/>
                <circle cx="13.25" cy="8.4" r="8.8" fill="#050507"/>
                <circle cx="13.25" cy="8.4" r="7.5" fill="#fff"/>
                <ellipse cx="13.25" cy="8.4" rx="13.2" ry="2.9" transform="rotate(-25 13.25 8.4)" stroke="#050507" strokeWidth="0.9" strokeDasharray="28.2 28.2"/>
                <ellipse cx="13.25" cy="8.4" rx="13.2" ry="2.9" transform="rotate(-25 13.25 8.4)" stroke="#fff" strokeWidth="1.25" strokeDasharray="28.2 28.2"/>
              </svg>
            </div>
            <span className="font-semibold text-lg tracking-tight text-white group-hover:text-purple-200 transition-colors">
              EchoDeck
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Features
            </a>
            <Link href="/deck" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              My Deck
            </Link>
            <Link href="/marketplace" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Marketplace
            </Link>
            <Link href="/mimic" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Mimic Challenge
            </Link>
            <Link href="/help" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Docs
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-xs font-medium text-white/85 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              Sign in
            </Link>
            <Link
              href="/deck"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold text-black bg-white hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 transition-all"
            >
              <span>Launch Deck</span>
              <span className="size-4 rounded-full bg-black/10 flex items-center justify-center text-[10px]">
                ↗
              </span>
            </Link>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden size-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white"
              aria-label="Toggle menu"
            >
              <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Sheet */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 p-4 rounded-2xl bg-[#0e0e14]/95 backdrop-blur-3xl border border-white/10 shadow-2xl flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <a
              href="#features"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white"
            >
              Features
            </a>
            <Link
              href="/deck"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white"
            >
              My Deck
            </Link>
            <Link
              href="/marketplace"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white"
            >
              Marketplace
            </Link>
            <Link
              href="/mimic"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white"
            >
              Mimic Challenge
            </Link>
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="w-full mt-2 py-3 rounded-xl bg-white text-black font-semibold text-center text-sm"
            >
              Sign in with Twitch
            </Link>
          </div>
        )}
      </header>

      {/* ─── SECTION 1: HERO VIEWPORT ─── */}
      <section className="relative min-h-[95vh] md:min-h-screen flex flex-col justify-between pt-36 md:pt-40 pb-12 px-6 overflow-hidden">
        {/* Background artwork */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          <video
            ref={videoRef}
            className="w-full h-full object-cover object-center scale-[1.03]"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/0bf7409c-9fa2-4bef-a49d-34903dcc91ad.png"
            src="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/4b73c700-3112-4c07-bd48-0af2893dff7c.mp4"
          />
          {/* Subtle vignette + gradient transition into content below */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-black/60" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,transparent_20%,#050507_90%)] opacity-80" />
        </div>

        {/* Hero Content (Generous, High-Impact Agency Sizing) */}
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center my-auto">
          {/* Eyebrow Pill */}
          <a
            href="#features"
            className="group inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-xl shadow-lg mb-8 transition-all hover:scale-[1.02]"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
              Live Soundboard
            </span>
            <span className="text-xs text-white/80 font-medium">
              Press a sound. Make it yours.
            </span>
            <span className="text-white/60 group-hover:translate-x-0.5 transition-transform text-xs">
              →
            </span>
          </a>

          {/* Master Headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.05] mb-6">
            <span className="block drop-shadow-sm">Press a sound.</span>
            <span className="block bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
              Bring it back.
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-base sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed font-normal mb-10">
            The next-generation soundboard for Twitch streamers. Fire off sound buzzers, let viewers trigger audio directly through the stream extension, and challenge yourself with voice mimic battles.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-semibold text-sm sm:text-base hover:bg-gray-100 active:scale-95 transition-all shadow-[0_0_35px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2 group"
            >
              <span>Get Started for Free</span>
              <span className="size-6 rounded-full bg-black/10 flex items-center justify-center text-xs group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </Link>
            <Link
              href="/deck"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold text-sm sm:text-base backdrop-blur-xl active:scale-95 transition-all flex items-center justify-center"
            >
              Open Live Deck
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex flex-col items-center justify-center pt-8 text-white/40 animate-bounce">
          <span className="text-[11px] uppercase tracking-widest font-mono">Explore Platform</span>
          <svg className="w-4 h-4 mt-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ─── SECTION 2: THE STREAMER SYSTEM (BENTO GRID) ─── */}
      <section id="features" className="relative py-28 md:py-36 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-widest mb-4">
            Unified Audio Ecosystem
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6">
            Engineered for high-intensity broadcasts.
          </h2>
          <p className="text-base sm:text-lg text-white/60 leading-relaxed">
            No lag, no complex virtual audio routing headaches. EchoDeck synchronizes your keys, browser source, and Twitch viewer extension into one continuous loop.
          </p>
        </div>

        {/* Bento Grid with Double-Bezel Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 10-Key Buzzer Matrix */}
          <div className="rounded-[2rem] p-2 bg-white/[0.04] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            <div className="h-full rounded-[calc(2rem-0.5rem)] p-7 bg-[#0b0b10] border border-white/5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-purple-400">
                  01 • Tactile Deck
                </span>
                <h3 className="text-xl font-semibold text-white mt-2 mb-3">
                  10-Slot Quick Buzzer Pages
                </h3>
                <p className="text-sm text-white/60 leading-relaxed mb-6">
                  Switch sound pages with arrow keys or A/D. Trigger audio with keys 1–9 and 0, touch screen taps, or assign them to your Stream Deck.
                </p>
              </div>

              {/* Interactive Micro Deck Preview */}
              <div className="p-4 rounded-2xl bg-black/50 border border-white/5">
                <div className="flex items-center justify-between text-xs text-white/40 mb-3 font-mono">
                  <span>Page 1: Reactions</span>
                  <span className="text-emerald-400">Ready</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {sampleBuzzers.map((b, idx) => (
                    <button
                      key={b.key}
                      onClick={() => setActiveBuzzer(idx)}
                      className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center transition-all ${
                        activeBuzzer === idx
                          ? "bg-white text-black border-white scale-105 shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                          : "bg-white/5 border-white/10 hover:border-white/20 text-white"
                      }`}
                    >
                      <span className="text-[10px] font-mono opacity-60">{b.key}</span>
                      <div
                        className="size-2 rounded-full mt-1"
                        style={{ backgroundColor: b.color }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Twitch Viewer Panel Extension */}
          <div className="rounded-[2rem] p-2 bg-white/[0.04] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            <div className="h-full rounded-[calc(2rem-0.5rem)] p-7 bg-[#0b0b10] border border-white/5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-blue-400">
                  02 • Interactive Audience
                </span>
                <h3 className="text-xl font-semibold text-white mt-2 mb-3">
                  Viewer Twitch Extension
                </h3>
                <p className="text-sm text-white/60 leading-relaxed mb-6">
                  Audience members trigger allowed sound clips directly beneath your live video with automatic cooldowns, follower gates, and subscriber perks.
                </p>
              </div>

              {/* Twitch Panel Preview */}
              <div className="p-4 rounded-2xl bg-black/50 border border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-300 font-medium">Twitch Panel Extension</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Live</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-white">Emotional Damage</div>
                    <div className="text-[10px] text-white/40">2s cooldown • Followers</div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-[11px] font-semibold">
                    Request
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: AI Mimic Challenge */}
          <div className="rounded-[2rem] p-2 bg-white/[0.04] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            <div className="h-full rounded-[calc(2rem-0.5rem)] p-7 bg-[#0b0b10] border border-white/5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
                  03 • Mimic Challenge
                </span>
                <h3 className="text-xl font-semibold text-white mt-2 mb-3">
                  Live Voice Impression AI
                </h3>
                <p className="text-sm text-white/60 leading-relaxed mb-6">
                  Hear the original clip, record your best voice imitation in 3 takes, compare live audio waveforms, and publish your take to the community marketplace.
                </p>
              </div>

              {/* Waveform Mockup */}
              <div className="p-4 rounded-2xl bg-black/50 border border-white/5 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono text-white/50">
                  <span>Take #2: 96% Match</span>
                  <span className="text-emerald-400 font-bold">New Record</span>
                </div>
                {/* Waveform visual bars */}
                <div className="flex items-center gap-1 h-10 px-2 py-1 bg-white/[0.02] rounded-lg">
                  {[20, 45, 80, 60, 95, 70, 40, 65, 85, 30, 75, 90, 50, 35, 60, 40, 80, 55, 30].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-purple-400/80 rounded-full"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: BROADCAST CTA ─── */}
      <section className="relative py-20 px-6 max-w-5xl mx-auto">
        <div className="rounded-[2.5rem] p-2 bg-gradient-to-b from-white/15 to-white/5 shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
          <div className="rounded-[calc(2.5rem-0.5rem)] p-10 sm:p-16 bg-[#0a0a0f] border border-white/10 text-center relative overflow-hidden">
            {/* Ambient Purple Orb */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-mono uppercase tracking-widest mb-6">
                Broadcast Ready
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6">
                Upgrade your Twitch channel audio today.
              </h2>
              <p className="text-base sm:text-lg text-white/60 max-w-xl mx-auto leading-relaxed mb-10">
                Connect your channel, build your 10-key deck, and watch your chat light up with audio engagement.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-semibold text-base hover:bg-gray-100 shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all"
                >
                  Connect with Twitch
                </Link>
                <Link
                  href="/marketplace"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold text-base backdrop-blur-xl transition-all"
                >
                  Explore Sound Marketplace
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/10 py-12 px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-white/50">
        <div className="flex items-center gap-2">
          <div className="size-5 rounded-full bg-white/10 flex items-center justify-center text-white text-[10px]">
            E
          </div>
          <span>&copy; 2026 EchoDeck. Designed for live broadcasts.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/deck" className="hover:text-white transition-colors">My Deck</Link>
          <Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
          <Link href="/mimic" className="hover:text-white transition-colors">Mimic</Link>
          <Link href="/help" className="hover:text-white transition-colors">Help</Link>
        </div>
      </footer>
    </div>
  )
}
