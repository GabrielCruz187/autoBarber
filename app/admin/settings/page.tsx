import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SettingsClient } from "./settings-client"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: barbershop } = await supabase
    .from("barbershops")
    .select("*")
    .eq("owner_id", user.id)
    .single()

  if (!barbershop) {
    redirect("/admin")
  }

  return <SettingsClient barbershop={barbershop} />
}
