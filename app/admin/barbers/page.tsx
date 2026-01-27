import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BarbersClient } from "./barbers-client"

export default async function BarbersPage() {
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

  const { data: barbers } = await supabase
    .from("barbers")
    .select("*")
    .eq("barbershop_id", barbershop.id)
    .order("created_at", { ascending: false })

  return <BarbersClient barbers={barbers || []} barbershopId={barbershop.id} />
}
