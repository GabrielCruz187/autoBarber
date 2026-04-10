'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Barber } from '@/lib/types'
import { X } from 'lucide-react'

interface AppointmentFiltersProps {
  barbers: Barber[]
  selectedBarbers: string[]
  selectedStatus: string
  onBarberChange: (barberIds: string[]) => void
  onStatusChange: (status: string) => void
  onClear: () => void
}

const statuses = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'completed', label: 'Finalizado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'no_show', label: 'Não Compareceu' },
]

export function AppointmentFilters({
  barbers,
  selectedBarbers,
  selectedStatus,
  onBarberChange,
  onStatusChange,
  onClear,
}: AppointmentFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleBarber = (barberId: string) => {
    if (selectedBarbers.includes(barberId)) {
      onBarberChange(selectedBarbers.filter(id => id !== barberId))
    } else {
      onBarberChange([...selectedBarbers, barberId])
    }
  }

  const hasActiveFilters = selectedBarbers.length > 0 || selectedStatus !== 'all'

  return (
    <Card className="w-full lg:w-64">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Filtros</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-auto p-0 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filtro de Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Barbeiros */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Barbeiros</label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {barbers.map(barber => (
              <label
                key={barber.id}
                className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedBarbers.includes(barber.id)}
                  onChange={() => toggleBarber(barber.id)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm">
                  {barber.first_name} {barber.last_name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Botão Aplicar */}
        <Button className="w-full mt-4" size="sm">
          Aplicar Filtros
        </Button>
      </CardContent>
    </Card>
  )
}
