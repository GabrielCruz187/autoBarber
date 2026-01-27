"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { format, addMinutes } from "date-fns"
import type { Appointment, Barber, Service, Client } from "@/lib/types"

interface AppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  barbershopId: string
  appointment?: Appointment | null
  barbers: Barber[]
  services: Service[]
  clients: Client[]
  defaultDate?: Date
}

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
]

export function AppointmentDialog({
  open,
  onOpenChange,
  barbershopId,
  appointment,
  barbers,
  services,
  clients,
}: AppointmentDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    barber_id: appointment?.barber_id || "",
    client_id: appointment?.client_id || "",
    service_id: appointment?.service_id || "",
    date: appointment ? format(new Date(appointment.start_time), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    time: appointment ? format(new Date(appointment.start_time), "HH:mm") : "09:00",
    status: appointment?.status || "pending",
    notes: appointment?.notes || "",
  })

  const selectedService = services.find(s => s.id === formData.service_id)

  useEffect(() => {
    if (appointment) {
      setFormData({
        barber_id: appointment.barber_id,
        client_id: appointment.client_id,
        service_id: appointment.service_id,
        date: format(new Date(appointment.start_time), "yyyy-MM-dd"),
        time: format(new Date(appointment.start_time), "HH:mm"),
        status: appointment.status,
        notes: appointment.notes || "",
      })
    }
  }, [appointment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()
    
    const startTime = new Date(`${formData.date}T${formData.time}`)
    const duration = selectedService?.duration_minutes || 30
    const endTime = addMinutes(startTime, duration)

    const appointmentData = {
      barbershop_id: barbershopId,
      barber_id: formData.barber_id,
      client_id: formData.client_id,
      service_id: formData.service_id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: formData.status,
      notes: formData.notes || null,
      total_price: selectedService?.price || 0,
    }

    if (appointment) {
      const { error } = await supabase
        .from("appointments")
        .update(appointmentData)
        .eq("id", appointment.id)

      if (error) {
        toast.error("Failed to update appointment: " + error.message)
        setIsLoading(false)
        return
      }
      toast.success("Appointment updated successfully")
    } else {
      const { error } = await supabase
        .from("appointments")
        .insert(appointmentData)

      if (error) {
        toast.error("Failed to create appointment: " + error.message)
        setIsLoading(false)
        return
      }
      toast.success("Appointment created successfully")
    }

    setIsLoading(false)
    onOpenChange(false)
    router.refresh()
  }

  const timeSlots = []
  for (let hour = 8; hour < 21; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const time = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`
      timeSlots.push(time)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{appointment ? "Edit Appointment" : "New Appointment"}</DialogTitle>
          <DialogDescription>
            {appointment ? "Update the appointment details." : "Schedule a new appointment."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client_id">Client</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="barber_id">Barber</Label>
              <Select
                value={formData.barber_id}
                onValueChange={(value) => setFormData({ ...formData, barber_id: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a barber" />
                </SelectTrigger>
                <SelectContent>
                  {barbers.filter(b => b.is_active).map((barber) => (
                    <SelectItem key={barber.id} value={barber.id}>
                      {barber.first_name} {barber.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_id">Service</Label>
              <Select
                value={formData.service_id}
                onValueChange={(value) => setFormData({ ...formData, service_id: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.filter(s => s.is_active).map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - ${service.price} ({service.duration_minutes} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Select
                  value={formData.time}
                  onValueChange={(value) => setFormData({ ...formData, time: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {format(new Date(`2000-01-01T${time}`), "h:mm a")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {appointment && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special notes or requests..."
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.barber_id || !formData.client_id || !formData.service_id}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {appointment ? "Updating..." : "Creating..."}
                </>
              ) : (
                appointment ? "Update Appointment" : "Create Appointment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
