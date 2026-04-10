'use client'

import React, { useState } from 'react'
import { AgendaGrid } from '@/components/admin/appointments/agenda-grid'
import { AppointmentFilters } from '@/components/admin/appointments/appointment-filters'
import { AppointmentDialog } from '@/components/admin/appointment-dialog'
import type { Appointment, Barber, Service, Client } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface AppointmentsClientProps {
  appointments: Appointment[]
  barbers: Barber[]
  services: Service[]
  clients: Client[]
  barbershopId: string
}

export function AppointmentsClient({
  appointments,
  barbers,
  services,
  clients,
  barbershopId,
}: AppointmentsClientProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedBarbers, setSelectedBarbers] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState('all')

  const filteredAppointments = appointments.filter(apt => {
    const statusMatch = selectedStatus === 'all' || apt.status === selectedStatus
    const barberMatch = selectedBarbers.length === 0 || (apt.barber_id && selectedBarbers.includes(apt.barber_id))
    return statusMatch && barberMatch
  })

  const handleClearFilters = () => {
    setSelectedBarbers([])
    setSelectedStatus('all')
  }

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setDialogOpen(true)
  }

  const handleNewAppointment = () => {
    setSelectedAppointment(null)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agenda de Agendamentos</h1>
          <p className="text-muted-foreground mt-1">Gerencie todos os agendamentos dos seus barbeiros</p>
        </div>
        <Button onClick={handleNewAppointment} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Agenda */}
        <div className="lg:col-span-3">
          <AgendaGrid
            appointments={filteredAppointments}
            barbers={barbers}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onAppointmentClick={handleAppointmentClick}
          />
        </div>

        {/* Filtros */}
        <div>
          <AppointmentFilters
            barbers={barbers}
            selectedBarbers={selectedBarbers}
            selectedStatus={selectedStatus}
            onBarberChange={setSelectedBarbers}
            onStatusChange={setSelectedStatus}
            onClear={handleClearFilters}
          />
        </div>
      </div>

      {/* Dialog de Agendamento */}
      <AppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        appointment={selectedAppointment}
        barbers={barbers}
        services={services}
        clients={clients}
        barbershopId={barbershopId}
      />
    </div>
  )
}
