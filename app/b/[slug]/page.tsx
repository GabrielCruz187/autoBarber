import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BookingFlow } from "@/components/public/booking/booking-flow"

interface BarbershopPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function BarbershopPage({ params }: BarbershopPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Buscar barbearia pelo slug
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

  // Buscar planos de assinatura
  const { data: subscriptionPlans } = await supabase
    .from("planos_assinatura")
    .select("*")
    .eq("barbershop_id", barbershop.id)
    .eq("ativo", true)
    .order("preco")

  return (
    <div className="min-h-screen bg-background">
      <BookingFlow
        barbershopId={barbershop.id}
        services={services || []}
        barbers={barbers || []}
        barbershopName={barbershop.name}
        subscriptionPlans={subscriptionPlans || []}
      />
    </div>
  )
}

