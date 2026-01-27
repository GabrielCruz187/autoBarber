import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppointmentsClient } from "./appointments-client"

export default async function AppointmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: barbershop } = await supabase
    .from("barbershops")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!barbershop) {
    redirect("/admin")
  }

  // Fetch all related data
  const [appointmentsRes, barbersRes, servicesRes, clientsRes] = await Promise.all([
    supabase
      .from("appointments")
      .select(`
        *,
        barber:barbers(id, first_name, last_name),
        client:clients(id, first_name, last_name),
        service:services(id, name, duration_minutes, price)
      `)
      .eq("barbershop_id", barbershop.id)
      .order("start_time", { ascending: false }),
    supabase
      .from("barbers")
      .select("*")
      .eq("barbershop_id", barbershop.id)
      .eq("is_active", true)
      .order("first_name"),
    supabase
      .from("services")
      .select("*")
      .eq("barbershop_id", barbershop.id)
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("clients")
      .select("*")
      .eq("barbershop_id", barbershop.id)
      .order("first_name"),
  ])

  return (
    <AppointmentsClient
      appointments={appointmentsRes.data || []}
      barbers={barbersRes.data || []}
      services={servicesRes.data || []}
      clients={clientsRes.data || []}
      barbershopId={barbershop.id}
    />
  )
}
