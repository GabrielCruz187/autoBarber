'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, Check } from 'lucide-react'

interface StepTimeSelectionProps {
  selectedTime: string | null
  selectedDate: Date | null
  serviceDuration: number
  onSelect: (time: string) => void
  onBack: () => void
}

export function StepTimeSelection({
  selectedTime,
  selectedDate,
  serviceDuration,
  onSelect,
  onBack,
}: StepTimeSelectionProps) {
  // Horários disponíveis (exemplo: 09:00 até 18:00, cada 30 minutos)
  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:30', '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30', '17:00', '17:30', '18:00',
  ]

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
          <h2 className="text-3xl font-bold">Escolha o Horário</h2>
          <p className="text-muted-foreground mt-1">
            Selecione o horário desejado
          </p>
        </div>
      </div>

      {selectedDate && (
        <p className="text-sm text-muted-foreground">
          Data: <span className="font-semibold text-foreground">
            {selectedDate.toLocaleDateString('pt-BR')}
          </span>
        </p>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {availableTimes.map((time) => (
          <Button
            key={time}
            variant={selectedTime === time ? 'default' : 'outline'}
            onClick={() => onSelect(time)}
            className="relative transition-all duration-200 hover:scale-105"
          >
            {time}
            {selectedTime === time && (
              <Check className="w-4 h-4 ml-1 absolute right-2" />
            )}
          </Button>
        ))}
      </div>

      {selectedTime && (
        <div className="p-4 bg-primary/5 border border-primary rounded-lg">
          <p className="text-sm text-muted-foreground">Horário selecionado:</p>
          <p className="text-lg font-semibold text-primary">{selectedTime}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Duração: {serviceDuration} minutos
          </p>
        </div>
      )}
    </div>
  )
}

