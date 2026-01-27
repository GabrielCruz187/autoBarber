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

  // Get the user's barbershop
  const { data: barbershop } = await supabase
    .from("barbershops")
    .select("name")
    .eq("owner_id", user.id)
    .single()

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
