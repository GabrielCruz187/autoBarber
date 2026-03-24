import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NavBar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { DifferentialsSection } from "@/components/landing/differentials-section"
import { SocialProofSection } from "@/components/landing/social-proof-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is logged in, redirect to admin
  if (user) {
    redirect("/admin")
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <HeroSection />
      <DifferentialsSection />
      <SocialProofSection />
      <CTASection />
      <Footer />
    </div>
  )
}

