'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { BookingState } from './booking-flow'

interface StepConfirmationProps {
  booking: BookingState
  services: any[]
  barbers: any[]
  isUserAuthenticated?: boolean
  onConfirm: () => void
  onBack: () => void
}

export function StepConfirmation({
  booking,
  services,
  barbers,
  isUserAuthenticated = false,
  onConfirm,
  onBack,
}: StepConfirmationProps) {
  const [isLoading, setIsLoading] = useState(false)

  const service = services.find(s => s.id === booking.serviceId)
  const barber = booking.barberId === 'any' 
    ? null 
    : barbers.find(b => b.id === booking.barberId)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      if (!booking.date || !booking.time) {
        throw new Error('Data e hora são obrigatórios')
      }

      // Converte a data para formato ISO antes de criar o objeto Date
      const dateStr = booking.date instanceof Date 
        ? booking.date.toISOString().split('T')[0] 
        : booking.date
      
      const startTime = new Date(`${dateStr}T${booking.time}:00`)
      const endTime = new Date(startTime.getTime() + (service?.duration_minutes || 60) * 60000)
      
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barbershop_id: booking.barbershopId,
          service_id: booking.serviceId,
          barber_id: booking.barberId === 'any' ? null : booking.barberId,
          subscription_plan_id: booking.subscriptionPlanId,
          client_name: booking.clientName,
          client_phone: booking.clientPhone,
          client_email: booking.clientEmail || null,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao confirmar agendamento')
      }

      const data = await response.json()
      toast.success('Agendamento confirmado!')
      onConfirm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao confirmar agendamento')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="hover:bg-accent"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold">Confirme seu Agendamento</h2>
          <p className="text-muted-foreground mt-1">
            Revise os detalhes antes de confirmar
          </p>
        </div>
      </div>

      <Card className="p-6 sm:p-8 space-y-6 border-2 border-muted/30 rounded-2xl bg-card/50">
        {/* Serviço */}
        <div className="space-y-3 pb-6 border-b-2 border-muted/20">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Serviço Selecionado
          </p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">{service?.name}</p>
              <p className="text-sm text-muted-foreground mt-1 flex gap-2">
                <span>{service?.duration_minutes} min</span>
              </p>
            </div>
            <p className="text-xl font-bold text-primary">R$ {(service?.price / 100).toFixed(2)}</p>
          </div>
        </div>

        {/* Barbeiro */}
        <div className="space-y-3 pb-6 border-b-2 border-muted/20">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Profissional
          </p>
          <p className="text-lg font-bold text-foreground">
            {barber
              ? `${barber.first_name} ${barber.last_name}`
              : 'Qualquer Profissional Disponível'}
          </p>
        </div>

        {/* Data e Hora */}
        <div className="grid grid-cols-2 gap-4 pb-6 border-b-2 border-muted/20">
          <div className="space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Data
            </p>
            <p className="text-lg font-bold text-foreground">
              {booking.date?.toLocaleDateString('pt-BR', {
                weekday: 'short',
                month: 'short',
                day: '2-digit',
              })}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Horário
            </p>
            <p className="text-lg font-bold text-foreground">{booking.time}</p>
          </div>
        </div>

        {/* Cliente */}
        <div className="space-y-3 pb-6 border-b-2 border-muted/20">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Seus Dados
          </p>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">{booking.clientName}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              📱 {booking.clientPhone}
            </p>
            {booking.clientEmail && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                ✉️ {booking.clientEmail}
              </p>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between pt-4 bg-primary/5 p-4 rounded-xl border-2 border-primary/20">
          <p className="text-lg font-bold text-foreground">Total</p>
          <p className="text-3xl font-bold text-primary">
            R$ {(service?.price / 100).toFixed(2)}
          </p>
        </div>
      </Card>

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 h-12 rounded-xl text-base font-semibold"
        >
          Voltar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isLoading}
          className="flex-1 h-12 rounded-xl text-base font-semibold"
          size="lg"
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isLoading ? 'Confirmando...' : 'Confirmar Agendamento'}
        </Button>
      </div>
    </div>
  )
}





