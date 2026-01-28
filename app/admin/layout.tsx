import React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get the user's profile and barbershop
  const { data: profile } = await supabase
    .from("profiles")
    .select("barbershop_id, onboarded")
    .eq("id", user.id)
    .single()

  // If user hasn't completed onboarding, redirect them
  if (!profile?.barbershop_id || !profile?.onboarded) {
    redirect("/onboarding")
  }

  // Get the barbershop info
  let { data: barbershop } = await supabase
    .from("barbershops")
    .select("id, name")
    .eq("id", profile.barbershop_id)
    .single()

  // If no barbershop exists, create one automatically
  if (!barbershop) {
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single()

      const barbershopName = `${profileData?.first_name || "My"} Barbershop`
      const slugName = barbershopName
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
      
      const { data: newBarbershop, error: insertError } = await supabase
        .from("barbershops")
        .insert({
          owner_id: user.id,
          name: barbershopName,
          slug: `${slugName}-${Date.now()}`,
          primary_color: "#0ea5e9",
          secondary_color: "#f97316",
          timezone: "UTC",
          currency: "USD",
          is_active: true,
        })
        .select("id, name")
        .single()

      if (!insertError && newBarbershop) {
        barbershop = newBarbershop

        // Create default services
        const defaultServices = [
          {
            name: "Haircut",
            description: "Classic haircut service",
            category: "Haircut",
            duration_minutes: 30,
            price: "25.00",
          },
          {
            name: "Beard Trim",
            description: "Professional beard trimming",
            category: "Beard",
            duration_minutes: 20,
            price: "15.00",
          },
          {
            name: "Fade",
            description: "Fade haircut with sharp lines",
            category: "Haircut",
            duration_minutes: 35,
            price: "30.00",
          },
          {
            name: "Full Grooming",
            description: "Haircut + beard + styling",
            category: "Package",
            duration_minutes: 60,
            price: "50.00",
          },
        ]

        const servicesData = defaultServices.map((service) => ({
          ...service,
          barbershop_id: newBarbershop.id,
          is_active: true,
        }))

        await supabase.from("services").insert(servicesData)

        // Create default working hours (Mon-Fri 9am-6pm, Sat 9am-5pm)
        const workingHoursData = [
          { day_of_week: 1, start_time: "09:00:00", end_time: "18:00:00", is_available: true },
          { day_of_week: 2, start_time: "09:00:00", end_time: "18:00:00", is_available: true },
          { day_of_week: 3, start_time: "09:00:00", end_time: "18:00:00", is_available: true },
          { day_of_week: 4, start_time: "09:00:00", end_time: "18:00:00", is_available: true },
          { day_of_week: 5, start_time: "09:00:00", end_time: "18:00:00", is_available: true },
          { day_of_week: 6, start_time: "09:00:00", end_time: "17:00:00", is_available: true },
        ]

        const whData = workingHoursData.map((wh) => ({
          ...wh,
          barbershop_id: newBarbershop.id,
        }))

        await supabase.from("working_hours").insert(whData)

        // Update profile with barbershop_id and owner role
        await supabase
          .from("profiles")
          .update({
            barbershop_id: newBarbershop.id,
            role: "owner",
          })
          .eq("id", user.id)
      }
    } catch (error) {
      console.error("[v0] Error auto-creating barbershop:", error)
      // Continue anyway - user will see the setup message
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar 
        barbershopName={barbershop?.name || "BarberPro"} 
        userEmail={user.email}
      />
      <main className="md:pl-64">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}


