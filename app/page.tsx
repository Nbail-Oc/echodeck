"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LandingHero } from "@/components/landing-hero"

export default function Page() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const user = localStorage.getItem("echodeck_user")
    if (user) {
      router.replace("/deck")
    } else {
      setIsAuthenticated(false)
    }
  }, [router])

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return <LandingHero />
}
