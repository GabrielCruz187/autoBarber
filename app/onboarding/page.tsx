import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OnboardingClient } from "./onboarding-client"

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user already has a barbershop (already onboarded)
  const { data: profile } = await supabase
    .from("profiles")
    .select("barbershop_id, onboarded")
    .eq("id", user.id)
    .single()

  if (profile?.barbershop_id && profile?.onboarded) {
    redirect("/admin")
  }

  return <OnboardingClient />
}
