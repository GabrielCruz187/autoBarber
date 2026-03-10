'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface ClientData {
  name: string
  phone: string
  email: string
}

interface StepClientInfoProps {
  clientData: ClientData
  onSubmit: (data: ClientData) => void
  onBack: () => void
}

export function StepClientInfo({
  clientData,
  onSubmit,
  onBack,
}: StepClientInfoProps) {
  const [formData, setFormData] = useState(clientData)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.phone) {
      toast.error('Por favor, preencha todos os campos obrigatórios')
      return
    }

    setIsLoading(true)
    try {
      onSubmit(formData)
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
          <h2 className="text-3xl font-bold">Suas Informações</h2>
          <p className="text-muted-foreground mt-1">
            Preencha seus dados para confirmar o agendamento
          </p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-base font-semibold">
              Nome *
            </Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-2"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-base font-semibold">
              WhatsApp *
            </Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="mt-2"
              disabled={isLoading}
              type="tel"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-base font-semibold">
              Email (opcional)
            </Label>
            <Input
              id="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="mt-2"
              disabled={isLoading}
              type="email"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full mt-6"
            disabled={isLoading}
          >
            {isLoading ? 'Processando...' : 'Continuar para Confirmação'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
