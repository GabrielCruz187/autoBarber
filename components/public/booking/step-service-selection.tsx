'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Clock } from 'lucide-react'

interface Service {
  id: string
  name: string
  duration_minutes: number
  price: number
}

interface StepServiceSelectionProps {
  services: Service[]
  selectedService: string | null
  onSelect: (serviceId: string) => void
}

export function StepServiceSelection({
  services,
  selectedService,
  onSelect,
}: StepServiceSelectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Escolha o Serviço</h2>
        <p className="text-muted-foreground mt-2 text-base">
          Selecione o serviço que deseja realizar
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1">
        {services.map((service) => (
          <Card
            key={service.id}
            className={`p-5 cursor-pointer transition-all duration-300 border-2 rounded-xl ${
              selectedService === service.id
                ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
                : 'border-transparent hover:border-primary/30 hover:shadow-md'
            }`}
            onClick={() => onSelect(service.id)}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-foreground truncate">
                  {service.name}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {service.duration_minutes} min
                  </div>
                  <span className="text-lg font-bold text-primary">
                    R$ {(service.price / 100).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    selectedService === service.id
                      ? 'bg-primary text-primary-foreground'
                      : 'border-2 border-muted-foreground/30 bg-transparent'
                  }`}
                >
                  {selectedService === service.id && (
                    <Check className="w-4 h-4" />
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
