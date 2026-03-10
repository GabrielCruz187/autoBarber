'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Check, ChevronLeft } from 'lucide-react'

interface Barber {
  id: string
  first_name: string
  last_name: string
  avatar_url?: string
  bio?: string
  specialties?: string[]
}

interface StepBarberSelectionProps {
  barbers: Barber[]
  selectedBarberId: string | null
  onSelect: (barberId: string) => void
  onBack: () => void
}

export function StepBarberSelection({
  barbers,
  selectedBarberId,
  onSelect,
  onBack,
}: StepBarberSelectionProps) {
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
          <h2 className="text-3xl font-bold">Escolha o Barbeiro</h2>
          <p className="text-muted-foreground mt-1">
            Selecione seu barbeiro preferido ou deixe automático
          </p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {/* Qualquer profissional disponível */}
        <Card
          className="p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-dashed border-2"
          onClick={() => onSelect('any')}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Qualquer Profissional</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Disponibilidade flexível
              </p>
            </div>
            {selectedBarberId === 'any' && (
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
            )}
          </div>
        </Card>

        {/* Barbeiros específicos */}
        {barbers.map((barber) => (
          <Card
            key={barber.id}
            className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
              selectedBarberId === barber.id
                ? 'border-primary bg-primary/5'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onSelect(barber.id)}
          >
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={barber.avatar_url} />
                <AvatarFallback>
                  {barber.first_name[0]}
                  {barber.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {barber.first_name} {barber.last_name}
                </h3>
                {barber.bio && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {barber.bio}
                  </p>
                )}
                {barber.specialties && barber.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {barber.specialties.slice(0, 2).map((spec, i) => (
                      <span
                        key={i}
                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {selectedBarberId === barber.id && (
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
