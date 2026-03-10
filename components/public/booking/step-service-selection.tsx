'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

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
        <h2 className="text-3xl font-bold">Escolha o Serviço</h2>
        <p className="text-muted-foreground mt-2">
          Selecione o serviço que deseja realizar
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {services.map((service) => (
          <Card
            key={service.id}
            className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
              selectedService === service.id
                ? 'border-primary bg-primary/5'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onSelect(service.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{service.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {service.duration_minutes} min
                </p>
              </div>
              {selectedService === service.id && (
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center animate-in fade-in-50">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-primary mt-4">
              R$ {(service.price / 100).toFixed(2)}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
