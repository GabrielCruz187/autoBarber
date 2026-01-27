"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format, isToday, isTomorrow } from "date-fns"
import type { Appointment } from "@/lib/types"

interface UpcomingAppointmentsProps {
  appointments: Appointment[]
}

function getDateLabel(date: Date): string {
  if (isToday(date)) return "Today"
  if (isTomorrow(date)) return "Tomorrow"
  return format(date, "EEE, MMM d")
}

export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming</CardTitle>
          <CardDescription>{"What's next on your schedule"}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No upcoming appointments scheduled.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming</CardTitle>
        <CardDescription>{"What's next on your schedule"}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => {
            const startDate = new Date(appointment.start_time)
            return (
              <div
                key={appointment.id}
                className="flex items-center gap-4 rounded-lg border p-3"
              >
                <div className="flex flex-col items-center justify-center rounded-lg bg-primary/10 px-3 py-2 min-w-[60px]">
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
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {appointment.client?.first_name?.[0] || "C"}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium truncate">
                      {appointment.client?.first_name} {appointment.client?.last_name}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {appointment.service?.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {appointment.barber?.first_name}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {appointment.service?.duration_minutes} min
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
