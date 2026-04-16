'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'

interface StepDateSelectionProps {
  selectedDate: Date | null
  onSelect: (date: Date) => void
  onBack: () => void
}

export function StepDateSelection({
  selectedDate,
  onSelect,
  onBack,
}: StepDateSelectionProps) {
  const [date, setDate] = useState<Date | undefined>(selectedDate || undefined)

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
      onSelect(selectedDate)
    }
  }

  // Bloqueiar domingos (dia 0)
  const isDateDisabled = (date: Date) => {
    return date.getDay() === 0 || date < new Date()
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
          <h2 className="text-3xl font-bold tracking-tight">Escolha a Data</h2>
          <p className="text-muted-foreground mt-1 text-base">
            Selecione o dia desejado para seu agendamento
          </p>
        </div>
      </div>

      <Card className="p-6 sm:p-8 flex justify-center bg-card/50 border-2 border-muted/30 rounded-2xl">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          disabled={isDateDisabled}
          className="w-full scale-100 sm:scale-110"
        />
      </Card>

      {date && (
        <Card className="p-5 bg-primary/5 border-2 border-primary rounded-2xl">
          <p className="text-sm text-muted-foreground font-medium">Data selecionada:</p>
          <p className="text-lg font-bold text-primary mt-1">
            {date.toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </Card>
      )}
    </div>
  )
}
