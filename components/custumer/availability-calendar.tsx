'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'

interface Slot {
  date: string
  time: string
  available: boolean
}

interface AvailabilityCalendarProps {
  barbershopId: string
  serviceId: string
}

export function AvailabilityCalendar({ barbershopId, serviceId }: AvailabilityCalendarProps) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    fetchAvailableSlots()
  }, [barbershopId, serviceId, currentDate])

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch(
        `/api/customer-portal/${barbershopId}/availability?serviceId=${serviceId}&date=${currentDate.toISOString().split('T')[0]}`
      )
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setSlots(data)
    } catch (error) {
      console.error('[v0] Error fetching availability:', error)
      toast.error('Erro ao carregar disponibilidade')
    } finally {
      setLoading(false)
    }
  }

  const handleBookWhatsApp = () => {
    if (!selectedSlot) {
      toast.error('Selecione um horário')
      return
    }

    // Format phone number without special chars
    const phoneNumber = '5511999999999' // Should come from barbershop config

    const message = encodeURIComponent(
      `Olá, gostaria de agendar um horário em ${selectedSlot.date} às ${selectedSlot.time}`
    )

    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
  }

  if (loading) {
    return <div className="text-center py-12">Carregando horários...</div>
  }

  return (
    <div className="space-y-6">
      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">
          {currentDate.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </h3>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Time Slots Grid */}
      {slots.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum horário disponível para esta data
        </div>
      ) : (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {slots.map((slot, idx) => (
            <Button
              key={idx}
              variant={selectedSlot?.time === slot.time ? 'default' : 'outline'}
              disabled={!slot.available}
              onClick={() => setSelectedSlot(slot)}
              className="h-12"
            >
              {slot.time}
            </Button>
          ))}
        </div>
      )}

      {/* Book Button */}
      <div className="pt-6 border-t">
        <Button
          onClick={handleBookWhatsApp}
          disabled={!selectedSlot}
          size="lg"
          className="w-full"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Agendar via WhatsApp
        </Button>
      </div>
    </div>
  )
}
