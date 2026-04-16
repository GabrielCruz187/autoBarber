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
          <h2 className="text-3xl font-bold tracking-tight">Escolha o Barbeiro</h2>
          <p className="text-muted-foreground mt-1 text-base">
            Selecione seu barbeiro preferido ou deixe automático
          </p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1">
        {/* Qualquer profissional disponível */}
        <Card
          className={`p-6 cursor-pointer transition-all duration-300 border-2 rounded-xl ${
            selectedBarberId === 'any'
              ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
              : 'border-dashed border-muted-foreground/40 hover:border-primary/30 hover:shadow-md'
          }`}
          onClick={() => onSelect('any')}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg">Qualquer Profissional</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Disponibilidade flexível
              </p>
            </div>
            <div className="flex-shrink-0">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  selectedBarberId === 'any'
                    ? 'bg-primary text-primary-foreground'
                    : 'border-2 border-muted-foreground/30 bg-transparent'
                }`}
              >
                {selectedBarberId === 'any' && (
                  <Check className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Barbeiros específicos */}
        {barbers.map((barber) => (
          <Card
            key={barber.id}
            className={`p-6 cursor-pointer transition-all duration-300 border-2 rounded-xl ${
              selectedBarberId === barber.id
                ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
                : 'border-transparent hover:border-primary/30 hover:shadow-md'
            }`}
            onClick={() => onSelect(barber.id)}
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 flex-shrink-0 border-2 border-muted-foreground/20">
                <AvatarImage src={barber.avatar_url} alt={barber.first_name} />
                <AvatarFallback className="text-lg font-semibold">
                  {barber.first_name[0]}
                  {barber.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-foreground">
                  {barber.first_name} {barber.last_name}
                </h3>
                {barber.bio && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {barber.bio}
                  </p>
                )}
                {barber.specialties && barber.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {barber.specialties.slice(0, 2).map((spec, i) => (
                      <span
                        key={i}
                        className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    selectedBarberId === barber.id
                      ? 'bg-primary text-primary-foreground'
                      : 'border-2 border-muted-foreground/30 bg-transparent'
                  }`}
                >
                  {selectedBarberId === barber.id && (
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

