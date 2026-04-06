'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Lock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium'>('basic')
  const [isLoading, setIsLoading] = useState(false)

  const barbershopId = searchParams.get('barbershopId')
  const trialExpiring = searchParams.get('trialExpiring') === 'true'

  const plans = {
    basic: {
      name: 'Plano Sistema',
      price: 3000,
      period: 'ano',
      description: 'Acesso completo ao sistema de agendamentos',
      features: [
        'Gerenciamento de agendamentos',
        'Painel de clientes',
        'Planos de assinatura',
        'Relatórios básicos',
        'Suporte por email',
        'Até 50 clientes',
      ],
    },
    premium: {
      name: 'Plano Sistema + Fiscal',
      price: 4000,
      period: 'ano',
      description: 'Sistema completo + Módulo Fiscal (NFe)',
      features: [
        'Tudo do Plano Sistema',
        'Módulo Fiscal integrado',
        'Emissão de NFe',
        'Integração Cibradi',
        'Suporte prioritário',
        'Clientes ilimitados',
      ],
    },
  }

  const handleCheckout = async () => {
    if (!barbershopId) {
      toast.error('Erro', { description: 'ID da barbearia não encontrado' })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barbershopId,
          planType: selectedPlan,
          amount: plans[selectedPlan].price,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar sessão de checkout')
      }

      // Redirecionar para Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      toast.error('Erro', {
        description: error instanceof Error ? error.message : 'Erro ao processar pagamento',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl font-bold">Escolha seu Plano</h1>
          <p className="text-lg text-muted-foreground">
            {trialExpiring
              ? 'Seu período de teste está terminando. Escolha um plano para continuar usando o sistema.'
              : 'Comece com 7 dias grátis e escolha o plano que melhor se adequa ao seu negócio'}
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {Object.entries(plans).map(([key, plan]) => (
            <Card
              key={key}
              className={`relative transition-all ${
                selectedPlan === key ? 'ring-2 ring-primary shadow-lg' : ''
              }`}
              onClick={() => setSelectedPlan(key as 'basic' | 'premium')}
            >
              {key === 'premium' && (
                <div className="absolute -top-4 left-4">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-600">
                    Recomendado
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">R$ {plan.price.toLocaleString('pt-BR')}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    R$ {(plan.price / 12).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}/mês
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                  variant={selectedPlan === key ? 'default' : 'outline'}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Continuar com Pagamento'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold flex gap-2">
                <Lock className="h-5 w-5 text-blue-600" />
                Informações sobre o Módulo Fiscal
              </h3>
              <div className="text-sm text-blue-900 space-y-2">
                <p>
                  <strong>O que é?</strong> Sistema de emissão de Notas Fiscais Eletrônicas (NFe) integrado ao seu
                  sistema de agendamentos.
                </p>
                <p>
                  <strong>Como funciona?</strong> Cada agendamento realizado pode gerar automaticamente uma NFe,
                  registrada nos órgãos fiscais.
                </p>
                <p>
                  <strong>Custo Cibradi:</strong> Aproximadamente R$ 0,50 a R$ 1,00 por nota emitida (vai variar
                  conforme o provedor integrado).
                </p>
                <p>
                  <strong>Integração:</strong> Utilizamos provedores como Tiny ERP ou Pluggy para integração com
                  Cibradi e Sefaz.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground space-y-2">
          <p>Pagamento seguro com Stripe</p>
          <p>Você receberá uma nota fiscal pela compra do plano de sistema</p>
        </div>
      </div>
    </div>
  )
}
<parameter name="taskNameActive">Creating checkout page
