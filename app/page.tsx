import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NavBar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { DifferentialsSection } from "@/components/landing/differentials-section"
import { SocialProofSection } from "@/components/landing/social-proof-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export default async function HomePage() {
  // Verificar se Supabase está configurado
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let user = null

  // Só tentar fazer login se Supabase estiver configurado
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = await createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      user = authUser

      if (user) {
        redirect("/admin")
      }
    } catch (error) {
      console.error('[v0] Erro ao verificar autenticação:', error)
      // Continuar sem erro se Supabase não estiver funcionando
    }
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



