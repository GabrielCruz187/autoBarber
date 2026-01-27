import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StatsCard } from "@/components/admin/stats-card"
import { RecentAppointments } from "@/components/admin/recent-appointments"
import { UpcomingAppointments } from "@/components/admin/upcoming-appointments"
import { Calendar, DollarSign, Users, Scissors } from "lucide-react"
import type { Appointment } from "@/lib/types"

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get the user's barbershop
  const { data: barbershop } = await supabase
    .from("barbershops")
    .select("id, name")
    .eq("owner_id", user.id)
    .single()

  if (!barbershop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Scissors className="h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Welcome to BarberPro</h1>
        <p className="text-muted-foreground max-w-md">
          Your barbershop is being set up. Please wait a moment and refresh the page, 
          or check your email to complete the verification process.
        </p>
      </div>
    )
  }

  const today = new Date()
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())).toISOString()

  // Get today's appointments count
  const { count: todayAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("barbershop_id", barbershop.id)
    .gte("start_time", startOfDay)
    .lte("start_time", endOfDay)

  // Get week's revenue
  const { data: weekAppointments } = await supabase
    .from("appointments")
    .select("total_price")
    .eq("barbershop_id", barbershop.id)
    .eq("status", "completed")
    .gte("start_time", startOfWeek)

  const weekRevenue = weekAppointments?.reduce((sum, a) => sum + (a.total_price || 0), 0) || 0

  // Get total clients
  const { count: totalClients } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("barbershop_id", barbershop.id)

  // Get active barbers
  const { count: activeBarbers } = await supabase
    .from("barbers")
    .select("*", { count: "exact", head: true })
    .eq("barbershop_id", barbershop.id)
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
    .eq("barbershop_id", barbershop.id)
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
    .eq("barbershop_id", barbershop.id)
    .gte("start_time", new Date().toISOString())
    .in("status", ["pending", "confirmed"])
    .order("start_time", { ascending: true })
    .limit(5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! {"Here's"} an overview of your barbershop.
        </p>
      </div>

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
