'use client'

import React, { useMemo } from 'react'
import { format, add, startOfDay, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Appointment, Barber } from '@/lib/types'
import { AppointmentBlock } from './appointments-block'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AgendaGridProps {
  appointments: Appointment[]
  barbers: Barber[]
  selectedDate: Date
  onDateChange: (date: Date) => void
  onAppointmentClick: (appointment: Appointment) => void
}

const BUSINESS_HOURS_START = 9
const BUSINESS_HOURS_END = 18
const TIME_SLOT_DURATION = 10

export function AgendaGrid({
  appointments,
  barbers,
  selectedDate,
  onDateChange,
  onAppointmentClick,
}: AgendaGridProps) {
  const timeSlots = useMemo(() => {
    const slots: string[] = []
    for (let hour = BUSINESS_HOURS_START; hour < BUSINESS_HOURS_END; hour++) {
      for (let minute = 0; minute < 60; minute += TIME_SLOT_DURATION) {
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }, [])

  const timeToSlotIndex = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return (hours - BUSINESS_HOURS_START) * (60 / TIME_SLOT_DURATION) + minutes / TIME_SLOT_DURATION
  }

  const calculateBlockHeight = (durationMinutes: number): number => {
    return (durationMinutes / TIME_SLOT_DURATION) * 40
  }

  const appointmentsByBarber = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {}
    barbers.forEach(barber => {
      grouped[barber.id] = []
    })
    
    appointments.forEach(apt => {
      const startDate = new Date(apt.start_time)
      if (startDate.toDateString() === selectedDate.toDateString()) {
        if (apt.barber_id && grouped[apt.barber_id]) {
          grouped[apt.barber_id].push(apt)
        }
      }
    })
    
    return grouped
  }, [appointments, barbers, selectedDate])

  const CurrentTimeLine = () => {
    if (!isToday(selectedDate)) return null

    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const currentIndex = timeToSlotIndex(currentTime)

    return (
      <div
        className="absolute left-0 right-0 h-0.5 bg-red-500 z-10 pointer-events-none"
        style={{
          top: `${currentIndex * 40}px`,
        }}
      >
        <div className="absolute -left-12 -top-2 text-xs font-semibold text-red-500 w-10 text-right">
          {currentTime}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDateChange(add(selectedDate, { days: -1 }))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-center flex-1">
          <h2 className="text-2xl font-bold">
            {format(selectedDate, 'EEEE, d MMMM', { locale: ptBR })}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isToday(selectedDate) && 'Hoje'}
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onDateChange(add(selectedDate, { days: 1 }))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          onClick={() => onDateChange(startOfDay(new Date()))}
        >
          Hoje
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <div className="inline-flex min-w-full">
          <div className="sticky left-0 bg-muted border-r border-border z-10 w-20">
            <div className="h-16 flex items-end justify-center pb-2 border-b border-border">
              <span className="text-xs font-semibold text-muted-foreground">Horário</span>
            </div>
            <div className="divide-y divide-border">
              {timeSlots.map((time) => (
                <div key={time} className="h-10 flex items-start justify-center text-xs font-medium text-muted-foreground pt-1">
                  {time}
                </div>
              ))}
            </div>
          </div>

          {barbers.map((barber) => (
            <div key={barber.id} className="flex-1 min-w-max md:min-w-0 border-r border-border last:border-r-0">
              <div className="h-16 flex flex-col items-center justify-center gap-2 border-b border-border p-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {barber.first_name.charAt(0)}{barber.last_name.charAt(0)}
                </div>
                <div className="text-center text-xs">
                  <p className="font-semibold line-clamp-1">{barber.first_name}</p>
                  <p className="text-muted-foreground text-xs line-clamp-1">{barber.last_name}</p>
                </div>
              </div>

              <div className="relative divide-y divide-border">
                {timeSlots.map((time) => (
                  <div key={time} className="h-10 border-b border-border hover:bg-accent/50 transition-colors" />
                ))}

                <div className="absolute inset-0 pointer-events-none">
                  {appointmentsByBarber[barber.id].map((appointment) => {
                    const startTime = new Date(appointment.start_time)
                    const endTime = new Date(appointment.end_time)
                    const startTimeStr = `${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`
                    const durationMs = endTime.getTime() - startTime.getTime()
                    const durationMinutes = Math.round(durationMs / 60000)

                    const slotIndex = timeToSlotIndex(startTimeStr)
                    const height = calculateBlockHeight(durationMinutes)

                    return (
                      <div
                        key={appointment.id}
                        className="absolute left-1 right-1 pointer-events-auto cursor-pointer"
                        style={{
                          top: `${slotIndex * 40}px`,
                          height: `${height}px`,
                        }}
                        onClick={() => onAppointmentClick(appointment)}
                      >
                        <AppointmentBlock appointment={appointment} />
                      </div>
                    )
                  })}
                </div>

                <CurrentTimeLine />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
