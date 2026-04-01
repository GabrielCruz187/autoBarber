'use client'

import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface StepSuccessProps {
  barbershopName: string
  clientName: string
}

export function StepSuccess({ barbershopName, clientName }: StepSuccessProps) {
  useEffect(() => {
    // Disparar evento para recarregar agendamentos no dashboard
    window.dispatchEvent(new Event('appointmentBooked'))
  }, [])

  return (
    <div className="space-y-6 py-12 text-center">
      <div className="flex justify-center animate-in fade-in-50 duration-300">
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl" />
          <CheckCircle2 className="w-24 h-24 text-green-500 relative animate-bounce" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-4xl font-bold">Agendamento Confirmado!</h2>
        <p className="text-xl text-muted-foreground">
          Obrigado, <span className="font-semibold text-foreground">{clientName}</span>!
        </p>
      </div>

      <Card className="p-8 bg-green-50 border-green-200 space-y-4">
        <p className="text-lg text-green-900">
          Seu agendamento foi confirmado com sucesso em <span className="font-bold">{barbershopName}</span>.
        </p>
        <p className="text-green-800">
          Você receberá um SMS com os detalhes do agendamento. Se tiver dúvidas, entre em contato conosco pelo WhatsApp.
        </p>
      </Card>

      <div className="space-y-3 pt-6">
        <Button asChild size="lg" className="w-full">
          <Link href="/">Voltar ao Início</Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Confira seu SMS para detalhes completos do agendamento
        </p>
      </div>
    </div>
  )
}

