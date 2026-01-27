import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ServicesClient } from "./services-client"

export default async function ServicesPage() {
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

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("barbershop_id", barbershop.id)
    .order("category", { ascending: true })
    .order("name", { ascending: true })

  return <ServicesClient services={services || []} barbershopId={barbershop.id} />
}
