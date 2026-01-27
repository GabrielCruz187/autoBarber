import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ClientsClient } from "./clients-client"

export default async function ClientsPage() {
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

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("barbershop_id", barbershop.id)
    .order("created_at", { ascending: false })

  return <ClientsClient clients={clients || []} barbershopId={barbershop.id} />
}
