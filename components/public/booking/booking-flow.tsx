'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

export interface BookingState {
  serviceId: string | null
  barberId: string | null
  date: Date | null
  time: string | null
  subscriptionPlanId: string | null
  clientName: string
  clientPhone: string
  clientEmail: string
  barbershopId?: string
}

interface BookingFlowProps {
  barbershopId: string
  services: any[]
  barbers: any[]
  barbershopName: string
  subscriptionPlans?: any[]
  onBookingComplete?: () => void
}

export function BookingFlow({
  barbershopId,
  services,
  barbers,
  barbershopName,
  subscriptionPlans = [],
  onBookingComplete,
}: BookingFlowProps) {
  const [step, setStep] = useState(1)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [booking, setBooking] = useState<BookingState>({
    serviceId: null,
    barberId: null,
    date: null,
    time: null,
    subscriptionPlanId: null,
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    barbershopId: barbershopId,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setIsAuthenticated(true)
          setBooking(prev => ({
            ...prev,
            clientName: user.user_metadata?.name || user.email?.split('@')[0] || '',
            clientEmail: user.email || '',
            clientPhone: user.user_metadata?.phone || '',
          }))
        }
      } catch (error) {
        console.error("[v0] Erro ao verificar autenticação:", error)
      } finally {
        setIsLoadingAuth(false)
      }
    }

    checkAuth()
  }, [])

  const updateBooking = (updates: Partial<BookingState>) => {
    setBooking(prev => ({ ...prev, ...updates }))
  }

  const handleSubmit = async () => {
    if (!booking.serviceId || !booking.date || !booking.time || !booking.clientPhone || !booking.clientName) {
      toast.error('Por favor, preencha todos os campos obrigatórios')
      return
    }

    setIsSubmitting(true)
    try {
      const start_time = new Date(booking.date)
      const [hours, minutes] = booking.time.split(':')
      start_time.setHours(parseInt(hours), parseInt(minutes))

      const service = services.find(s => s.id === booking.serviceId)
      const end_time = new Date(start_time.getTime() + (service?.duration_minutes || 30) * 60000)

      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barbershop_id: barbershopId,
          service_id: booking.serviceId,
          barber_id: booking.barberId || null,
          subscription_plan_id: booking.subscriptionPlanId,
          client_name: booking.clientName,
          client_phone: booking.clientPhone,
          client_email: booking.clientEmail || null,
          start_time: start_time.toISOString(),
          end_time: end_time.toISOString(),
        }),
      })

      if (!response.ok) throw new Error('Erro ao criar agendamento')
      
      toast.success('Agendamento confirmado!')
      onBookingComplete?.()
    } catch (error) {
      console.error("[v0] Erro ao criar agendamento:", error)
      toast.error('Erro ao confirmar agendamento')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingAuth) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200/50 px-4 py-4">
        <div className="flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="w-10" />
          )}
          <h2 className="font-semibold text-slate-900">Agendar Corte</h2>
          <div className="w-10" />
        </div>
        
        {/* Progress Indicator */}
        <div className="mt-4 flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-primary' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {step === 1 && (
          <ServiceSelection
            services={services}
            selected={booking.serviceId}
            onSelect={(serviceId) => {
              updateBooking({ serviceId })
              setStep(2)
            }}
          />
        )}

        {step === 2 && (
          <BarberSelection
            barbers={barbers}
            selected={booking.barberId}
            onSelect={(barberId) => {
              updateBooking({ barberId })
              setStep(3)
            }}
          />
        )}

        {step === 3 && (
          <DateTimeSelection
            selected={{ date: booking.date, time: booking.time }}
            onSelect={(date, time) => {
              updateBooking({ date, time })
              setStep(4)
            }}
          />
        )}

        {step === 4 && (
          <ConfirmationStep
            booking={booking}
            services={services}
            barbers={barbers}
            onConfirm={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {/* Footer - Botão Fixo */}
      {step < 4 && (
        <div className="sticky bottom-0 bg-white border-t border-slate-200/50 p-4 space-y-2">
          <Button
            onClick={() => setStep(Math.min(step + 1, 4))}
            className="w-full h-11 rounded-full font-semibold"
          >
            Continuar
          </Button>
        </div>
      )}
    </div>
  )
}

function ServiceSelection({
  services,
  selected,
  onSelect,
}: {
  services: any[]
  selected: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Escolha o Serviço</h3>
        <p className="text-sm text-slate-600">Qual serviço deseja contratar?</p>
      </div>

      <div className="space-y-3">
        {services.map((service) => (
          <Card
            key={service.id}
            onClick={() => onSelect(service.id)}
            className={`cursor-pointer border-2 transition-all ${
              selected === service.id
                ? 'border-primary bg-primary/5'
                : 'border-slate-200 hover:border-primary/50'
            }`}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900">{service.name}</h4>
                <div className="flex gap-4 mt-2 text-sm text-slate-600">
                  <span>{service.duration_minutes} min</span>
                  <span>R$ {(service.price / 100).toFixed(2)}</span>
                </div>
              </div>
              {selected === service.id && (
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function BarberSelection({
  barbers,
  selected,
  onSelect,
}: {
  barbers: any[]
  selected: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Escolha o Barbeiro</h3>
        <p className="text-sm text-slate-600">Quem vai fazer seu corte?</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {barbers.map((barber) => (
          <div
            key={barber.id}
            onClick={() => onSelect(barber.id)}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              selected === barber.id
                ? 'border-primary bg-primary/5'
                : 'border-slate-200 hover:border-primary/50 bg-white'
            }`}
          >
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-slate-200 mx-auto mb-3 flex items-center justify-center font-semibold text-slate-700">
                {barber.first_name.charAt(0)}
              </div>
              <p className="font-semibold text-sm text-slate-900">{barber.first_name}</p>
              <p className="text-xs text-slate-600 mt-1">Disponível</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DateTimeSelection({
  selected,
  onSelect,
}: {
  selected: { date: Date | null; time: string | null }
  onSelect: (date: Date, time: string) => void
}) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(selected.date)
  const [selectedTime, setSelectedTime] = useState<string | null>(selected.time)

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ]

  const nextDays = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return date
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Data e Hora</h3>
        <p className="text-sm text-slate-600">Quando você quer agendar?</p>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-900 mb-3">Selecione a Data</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {nextDays.map((date) => (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={`px-4 py-3 rounded-xl whitespace-nowrap transition-all font-medium text-sm ${
                selectedDate?.toDateString() === date.toDateString()
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <div>{date.toLocaleDateString('pt-BR', { weekday: 'short' })}</div>
              <div>{date.getDate()}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-900 mb-3">Selecione a Hora</p>
        <div className="grid grid-cols-3 gap-2">
          {timeSlots.map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`py-2 rounded-full transition-all font-medium text-sm ${
                selectedTime === time
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {selectedDate && selectedTime && (
        <Button
          onClick={() => onSelect(selectedDate, selectedTime)}
          className="w-full h-11 rounded-full font-semibold mt-4"
        >
          Confirmar Data e Hora
        </Button>
      )}
    </div>
  )
}

function ConfirmationStep({
  booking,
  services,
  barbers,
  onConfirm,
  isSubmitting,
}: {
  booking: BookingState
  services: any[]
  barbers: any[]
  onConfirm: () => void
  isSubmitting: boolean
}) {
  const service = services.find(s => s.id === booking.serviceId)
  const barber = barbers.find(b => b.id === booking.barberId)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Confirme seu Agendamento</h3>
        <p className="text-sm text-slate-600">Verifique os detalhes abaixo</p>
      </div>

      <Card className="bg-slate-50 border-0">
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between items-start pb-4 border-b border-slate-200">
            <span className="text-sm text-slate-600">Serviço</span>
            <span className="font-semibold text-slate-900">{service?.name}</span>
          </div>
          
          <div className="flex justify-between items-start pb-4 border-b border-slate-200">
            <span className="text-sm text-slate-600">Barbeiro</span>
            <span className="font-semibold text-slate-900">{barber?.first_name}</span>
          </div>

          <div className="flex justify-between items-start pb-4 border-b border-slate-200">
            <span className="text-sm text-slate-600">Data e Hora</span>
            <span className="font-semibold text-slate-900">
              {booking.date?.toLocaleDateString('pt-BR')} às {booking.time}
            </span>
          </div>

          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-600">Duração</span>
            <span className="font-semibold text-slate-900">{service?.duration_minutes} minutos</span>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">Confirmação:</span> Um SMS será enviado para {booking.clientPhone}
        </p>
      </div>

      <Button
        onClick={onConfirm}
        disabled={isSubmitting}
        className="w-full h-11 rounded-full font-semibold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Confirmando...
          </>
        ) : (
          'Confirmar Agendamento'
        )}
      </Button>
    </div>
  )
}




