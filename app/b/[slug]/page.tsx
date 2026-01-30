import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BarbershopHero } from "@/components/public/barbershop-hero"
import { ServicesSection } from "@/components/public/services-section"
import { BarbersSection } from "@/components/public/barbers-section"
import { ClientSignupSection } from "@/components/public/client-signup-section"

interface BarbershopPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function BarbershopPage({ params }: BarbershopPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Buscar barbearia pelo slug - sem autenticação necessária
  const { data: barbershop, error } = await supabase
    .from("barbershops")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error || !barbershop) {
    notFound()
  }

  // Buscar serviços
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("barbershop_id", barbershop.id)
    .eq("is_active", true)
    .order("name")

  // Buscar barbeiros
  const { data: barbers } = await supabase
    .from("barbers")
    .select("*")
    .eq("barbershop_id", barbershop.id)
    .eq("is_active", true)
    .order("first_name")

  return (
    <div className="min-h-screen bg-background">
      <BarbershopHero barbershop={barbershop} />
      <ServicesSection services={services || []} />
      <BarbersSection barbers={barbers || []} />
      <ClientSignupSection barbershop={barbershop} />
    </div>
  )
}
