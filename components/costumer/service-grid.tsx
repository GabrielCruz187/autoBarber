'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, DollarSign } from 'lucide-react'
import type { Service } from '@/lib/types'

interface ServiceGridProps {
  services: Service[]
  selectedId?: string | null
  onSelect: (id: string) => void
}

export function ServiceGrid({ services, selectedId, onSelect }: ServiceGridProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {services.map((service) => (
        <Card
          key={service.id}
          className={`p-4 cursor-pointer transition-all ${
            selectedId === service.id
              ? 'border-blue-500 bg-blue-50 border-2'
              : 'hover:border-blue-300 border'
          }`}
          onClick={() => onSelect(service.id)}
        >
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">{service.name}</h3>
            {service.description && (
              <p className="text-sm text-muted-foreground">{service.description}</p>
            )}

            <div className="flex gap-3 flex-wrap">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {service.duration_minutes}min
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {service.price}
              </Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
