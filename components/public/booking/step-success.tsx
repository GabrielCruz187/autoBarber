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
    <div className="space-y-8 py-8 text-center">
      <div className="flex justify-center animate-in fade-in-50 zoom-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/30 rounded-full blur-2xl" />
          <CheckCircle2 className="w-28 h-28 text-green-500 relative animate-bounce" />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-4xl font-bold tracking-tight">Agendamento Confirmado!</h2>
        <p className="text-xl text-muted-foreground">
          Obrigado, <span className="font-bold text-foreground">{clientName}</span>! 🎉
        </p>
      </div>

      <Card className="p-6 sm:p-8 bg-gradient-to-br from-green-50 to-green-50/50 border-2 border-green-200 dark:from-green-950/20 dark:to-green-950/10 dark:border-green-900 rounded-2xl space-y-4">
        <p className="text-lg text-green-900 dark:text-green-100 font-semibold">
          Seu agendamento foi confirmado com sucesso em <span className="font-bold">{barbershopName}</span>!
        </p>
        <p className="text-green-800 dark:text-green-200">
          Você receberá um SMS com os detalhes do agendamento. Se tiver dúvidas, entre em contato conosco pelo WhatsApp.
        </p>
      </Card>

      <div className="space-y-4 pt-4">
        <Button asChild size="lg" className="w-full h-12 rounded-xl text-base font-semibold">
          <Link href="/">Voltar ao Início</Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          ✓ Confira seu SMS para detalhes completos do agendamento
        </p>
      </div>
    </div>
  )
}
