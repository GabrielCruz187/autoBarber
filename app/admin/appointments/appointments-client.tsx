"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AppointmentDialog } from "@/components/admin/appointment-dialog"
import { 
  Plus, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { format, isToday, isTomorrow, isPast, isFuture, startOfDay } from "date-fns"
import type { Appointment, Barber, Service, Client } from "@/lib/types"

interface AppointmentsClientProps {
  appointments: Appointment[]
  barbers: Barber[]
  services: Service[]
  clients: Client[]
  barbershopId: string
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  no_show: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <AlertCircle className="h-3 w-3" />,
  confirmed: <CheckCircle className="h-3 w-3" />,
  in_progress: <Clock className="h-3 w-3" />,
  completed: <CheckCircle className="h-3 w-3" />,
  cancelled: <XCircle className="h-3 w-3" />,
  no_show: <XCircle className="h-3 w-3" />,
}

function getDateLabel(date: Date): string {
  if (isToday(date)) return "Today"
  if (isTomorrow(date)) return "Tomorrow"
  return format(date, "EEE, MMM d")
}

export function AppointmentsClient({
  appointments,
  barbers,
  services,
  clients,
  barbershopId,
}: AppointmentsClientProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [activeTab, setActiveTab] = useState("upcoming")

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedAppointment) return

    const supabase = createClient()
    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", selectedAppointment.id)

    if (error) {
      toast.error("Failed to delete appointment: " + error.message)
      return
    }

    toast.success("Appointment deleted successfully")
    setDeleteDialogOpen(false)
    setSelectedAppointment(null)
    router.refresh()
  }

  const handleStatusChange = async (appointment: Appointment, newStatus: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", appointment.id)

    if (error) {
      toast.error("Failed to update status: " + error.message)
      return
    }

    toast.success("Status updated successfully")
    router.refresh()
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) setSelectedAppointment(null)
  }

  // Filter appointments
  const today = startOfDay(new Date())
  const upcomingAppointments = appointments.filter(a => 
    isFuture(new Date(a.start_time)) && !["cancelled", "no_show"].includes(a.status)
  )
  const todayAppointments = appointments.filter(a => 
    isToday(new Date(a.start_time))
  )
  const pastAppointments = appointments.filter(a => 
    isPast(new Date(a.start_time)) && !isToday(new Date(a.start_time))
  )

  const renderAppointmentCard = (appointment: Appointment) => {
    const startDate = new Date(appointment.start_time)
    return (
      <Card key={appointment.id}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center justify-center rounded-lg bg-primary/10 px-3 py-2 min-w-[70px]">
                <span className="text-xs font-medium text-primary">
                  {getDateLabel(startDate)}
                </span>
                <span className="text-lg font-bold text-primary">
                  {format(startDate, "h:mm")}
                </span>
                <span className="text-xs text-primary">
                  {format(startDate, "a")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {appointment.client?.first_name?.[0] || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium truncate">
                    {appointment.client?.first_name} {appointment.client?.last_name}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {appointment.service?.name}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {appointment.barber?.first_name}
                  </Badge>
                  <Badge variant="secondary" className={`text-xs ${statusColors[appointment.status]}`}>
                    <span className="mr-1">{statusIcons[appointment.status]}</span>
                    {appointment.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="font-semibold">${appointment.total_price.toFixed(2)}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(appointment)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleStatusChange(appointment, "confirmed")}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark Confirmed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange(appointment, "completed")}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange(appointment, "cancelled")}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Mark Cancelled
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedAppointment(appointment)
                      setDeleteDialogOpen(true)
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderEmptyState = (message: string) => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No appointments</h3>
        <p className="text-muted-foreground text-center mb-4">{message}</p>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Appointment
        </Button>
      </CardContent>
    </Card>
  )

  const canCreateAppointment = barbers.length > 0 && services.length > 0 && clients.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Manage your schedule and bookings</p>
        </div>
        {canCreateAppointment ? (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        ) : (
          <Button disabled title="Add barbers, services, and clients first">
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        )}
      </div>

      {!canCreateAppointment && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Required</CardTitle>
            <CardDescription>
              Before you can create appointments, you need to add:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {barbers.length === 0 && <li>At least one barber</li>}
              {services.length === 0 && <li>At least one service</li>}
              {clients.length === 0 && <li>At least one client</li>}
            </ul>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="today">
            Today ({todayAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4 mt-4">
          {upcomingAppointments.length === 0 
            ? renderEmptyState("No upcoming appointments scheduled.")
            : upcomingAppointments.map(renderAppointmentCard)
          }
        </TabsContent>

        <TabsContent value="today" className="space-y-4 mt-4">
          {todayAppointments.length === 0 
            ? renderEmptyState("No appointments scheduled for today.")
            : todayAppointments.map(renderAppointmentCard)
          }
        </TabsContent>

        <TabsContent value="past" className="space-y-4 mt-4">
          {pastAppointments.length === 0 
            ? renderEmptyState("No past appointments to show.")
            : pastAppointments.map(renderAppointmentCard)
          }
        </TabsContent>
      </Tabs>

      <AppointmentDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        barbershopId={barbershopId}
        appointment={selectedAppointment}
        barbers={barbers}
        services={services}
        clients={clients}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
