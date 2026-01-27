"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import type { Appointment } from "@/lib/types"

interface RecentAppointmentsProps {
  appointments: Appointment[]
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  no_show: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
}

export function RecentAppointments({ appointments }: RecentAppointmentsProps) {
  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Appointments</CardTitle>
          <CardDescription>Your latest bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No appointments yet. They will appear here once clients start booking.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Appointments</CardTitle>
        <CardDescription>Your latest bookings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between gap-4 rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {appointment.client?.first_name?.[0] || "C"}
                    {appointment.client?.last_name?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {appointment.client?.first_name} {appointment.client?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {appointment.service?.name} with {appointment.barber?.first_name}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant="secondary" className={statusColors[appointment.status]}>
                  {appointment.status.replace("_", " ")}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(appointment.start_time), "MMM d, h:mm a")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
