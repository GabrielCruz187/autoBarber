import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StatsCard } from "@/components/admin/stats-card"
import { RecentAppointments } from "@/components/admin/recent-appointments"
import { UpcomingAppointments } from "@/components/admin/upcoming-appointments"
import { PublicPageLink } from "@/components/admin/public-page-link"
import { Calendar, DollarSign, Users, Scissors } from "lucide-react"
import type { Appointment } from "@/lib/types"
import { getToday } from "@/lib/utils" // Declare the getToday variable

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get the user's barbershop from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("barbershop_id")
    .eq("id", user.id)
    .single()

  if (!profile?.barbershop_id) {
    redirect("/onboarding")
  }

  const barbershop_id = profile.barbershop_id

  // Get barbershop data including slug
  const { data: barbershop } = await supabase
    .from("barbershops")
    .select("name, slug")
    .eq("id", barbershop_id)
    .single()

  const { startOfDay, endOfDay } = getToday()
  
  // Calculate start of week
  const weekDate = new Date()
  const startOfWeek = new Date(weekDate.setDate(weekDate.getDate() - weekDate.getDay())).toISOString()

  // Get today's appointments count
  const { count: todayAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("barbershop_id", barbershop_id)
    .gte("start_time", startOfDay)
    .lte("start_time", endOfDay)

  // Get week's revenue
  const { data: weekAppointments } = await supabase
    .from("appointments")
    .select("total_price")
    .eq("barbershop_id", barbershop_id)
    .eq("status", "completed")
    .gte("start_time", startOfWeek)

  const weekRevenue = weekAppointments?.reduce((sum, a) => sum + (a.total_price || 0), 0) || 0

  // Get total clients
  const { count: totalClients } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("barbershop_id", barbershop_id)

  // Get active barbers
  const { count: activeBarbers } = await supabase
    .from("barbers")
    .select("*", { count: "exact", head: true })
    .eq("barbershop_id", barbershop_id)
    .eq("is_active", true)

  // Get recent appointments with related data
  const { data: recentAppointments } = await supabase
    .from("appointments")
    .select(`
      *,
      barber:barbers(id, first_name, last_name),
      client:clients(id, first_name, last_name),
      service:services(id, name, duration_minutes)
    `)
    .eq("barbershop_id", barbershop_id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get upcoming appointments
  const { data: upcomingAppointments } = await supabase
    .from("appointments")
    .select(`
      *,
      barber:barbers(id, first_name, last_name),
      client:clients(id, first_name, last_name),
      service:services(id, name, duration_minutes)
    `)
    .eq("barbershop_id", barbershop_id)
    .gte("start_time", new Date().toISOString())
    .in("status", ["pending", "confirmed"])
    .order("start_time", { ascending: true })
    .limit(5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta! Aqui está um resumo de sua barbearia.
        </p>
      </div>

      {barbershop?.slug && (
        <PublicPageLink slug={barbershop.slug} barbershopName={barbershop.name || "Sua Barbearia"} />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Today's Appointments"
          value={todayAppointments || 0}
          description="Scheduled for today"
          icon={Calendar}
        />
        <StatsCard
          title="Week's Revenue"
          value={`$${weekRevenue.toFixed(2)}`}
          description="From completed appointments"
          icon={DollarSign}
        />
        <StatsCard
          title="Total Clients"
          value={totalClients || 0}
          description="Registered clients"
          icon={Users}
        />
        <StatsCard
          title="Active Barbers"
          value={activeBarbers || 0}
          description="Available for booking"
          icon={Scissors}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingAppointments appointments={(upcomingAppointments as Appointment[]) || []} />
        <RecentAppointments appointments={(recentAppointments as Appointment[]) || []} />
      </div>
    </div>
  )
}
