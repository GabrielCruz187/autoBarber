'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronLeft, CheckCircle2 } from 'lucide-react'
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
  isGuestMode?: boolean
}

export function StepClientInfo({
  clientData,
  onSubmit,
  onBack,
  isGuestMode = true,
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
      <div className="flex items-center gap-3">
        {!isGuestMode && (
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
        )}
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
            <h2 className="text-3xl font-bold tracking-tight">Suas Informações</h2>
            <p className="text-muted-foreground mt-1 text-base">
              {isGuestMode 
                ? 'Preencha seus dados para confirmar o agendamento'
                : 'Usando dados da sua conta autenticada'}
            </p>
          </div>
        </div>
      </div>

      <Card className="p-6 sm:p-8 border-2 border-muted/30 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="name" className="text-base font-semibold">
              Nome {!isGuestMode && <span className="text-xs text-green-600 ml-2">(autenticado)</span>} *
            </Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-2 text-base"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-base font-semibold">
              WhatsApp {!isGuestMode && <span className="text-xs text-green-600 ml-2">(autenticado)</span>} *
            </Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="mt-2 text-base"
              disabled={isLoading}
              type="tel"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-base font-semibold">
              Email {!isGuestMode && <span className="text-xs text-green-600 ml-2">(autenticado)</span>} (opcional)
            </Label>
            <Input
              id="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="mt-2 text-base"
              disabled={isLoading}
              type="email"
            />
          </div>

          {!isGuestMode && (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✓ Você está autenticado. Seus dados serão salvos automaticamente e usados nos próximos agendamentos.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl text-base font-semibold"
            >
              Voltar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl text-base font-semibold"
            >
              {isLoading ? 'Processando...' : 'Continuar para Confirmação'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
