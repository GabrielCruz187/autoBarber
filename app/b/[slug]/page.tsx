import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ClientDashboard } from "@/components/public/client-dashboard"

interface BarbershopPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    client_id?: string
  }>
}

export default async function BarbershopPage({ params, searchParams }: BarbershopPageProps) {
  const { slug } = await params
  const { client_id } = await searchParams
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

  // Buscar planos de assinatura visíveis
  const { data: subscriptionPlans } = await supabase
    .from("planos_assinatura")
    .select("*")
    .eq("barbershop_id", barbershop.id)
    .eq("ativo", true)
    .eq("visivel", true)
    .order("preco")

  // Buscar agendamentos do cliente se client_id for fornecido
  let upcomingAppointments = []
  let recentAppointments = []
  let clientName = ""

  if (client_id) {
    // Buscar próximos agendamentos (data >= hoje)
    const { data: upcoming } = await supabase
      .from("appointments")
      .select(`
        id,
        start_time,
        end_time,
        status,
        total_price,
        service:services(id, name, duration_minutes, price),
        barber:barbers(id, first_name, last_name)
      `)
      .eq("client_id", client_id)
      .eq("barbershop_id", barbershop.id)
      .neq("status", "cancelled")
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(5)

    upcomingAppointments = upcoming || []

    // Buscar agendamentos recentes (últimos 30 dias, já passados)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recent } = await supabase
      .from("appointments")
      .select(`
        id,
        start_time,
        end_time,
        status,
        total_price,
        service:services(id, name, duration_minutes, price),
        barber:barbers(id, first_name, last_name)
      `)
      .eq("client_id", client_id)
      .eq("barbershop_id", barbershop.id)
      .in("status", ["completed", "cancelled"])
      .lte("start_time", new Date().toISOString())
      .gte("start_time", thirtyDaysAgo.toISOString())
      .order("start_time", { ascending: false })
      .limit(5)

    recentAppointments = recent || []

    // Buscar nome do cliente
    const { data: client } = await supabase
      .from("clients")
      .select("first_name")
      .eq("id", client_id)
      .single()

    clientName = client?.first_name || ""
  }

  return (
    <ClientDashboard
      barbershopId={barbershop.id}
      barbershopName={barbershop.name}
      clientName={clientName}
      services={services || []}
      barbers={barbers || []}
      subscriptionPlans={subscriptionPlans || []}
      upcomingAppointments={upcomingAppointments}
      recentAppointments={recentAppointments}
    />
  )
}






