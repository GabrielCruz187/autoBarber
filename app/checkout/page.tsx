'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Lock, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const barbershopId = searchParams.get('barbershopId')
  const trialExpiring = searchParams.get('trialExpiring')

  const [selectedPlan, setSelectedPlan] = useState<'system' | 'system+fiscal' | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const plans = [
    {
      id: 'system',
      name: 'Plano Sistema',
      price: 3000,
      period: 'ano',
      description: 'Acesso completo ao sistema de agendamentos',
      features: [
        'Sistema completo de agendamentos',
        'Painel administrativo',
        'Gestão de clientes',
        'Gestão de barbeiros',
        'Planos de assinatura para clientes',
        'Dashboard de agendamentos',
        'Suporte técnico',
      ],
      highlighted: false,
    },
    {
      id: 'system+fiscal',
      name: 'Plano Sistema + Fiscal',
      price: 4000,
      period: 'ano',
      description: 'Sistema completo + Módulo fiscal NFe/RPS',
      features: [
        'Tudo do Plano Sistema, mais:',
        'Módulo fiscal integrado (NFe/RPS)',
        'Emissão de notas fiscais',
        'Integração com Cibradi',
        'Relatórios fiscais',
        'Conformidade com Receita Federal',
        'Suporte fiscal especializado',
      ],
      highlighted: true,
    },
  ]

  const handleCheckout = async (planId: string) => {
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
          planType: planId === 'system' ? 'basic' : 'premium',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar sessão de checkout')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast.error('Erro', {
        description: error instanceof Error ? error.message : 'Erro ao processar pagamento',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Escolha seu Plano</h1>
          <p className="text-xl text-muted-foreground">
            Desbloqueie o poder total do sistema de agendamentos
          </p>

          {trialExpiring && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg inline-block">
              <div className="flex items-center gap-2 text-amber-900">
                <AlertCircle className="h-5 w-5" />
                <span>Seu período de teste expirou. Escolha um plano para continuar usando o sistema.</span>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${
                plan.highlighted ? 'md:scale-105 border-2 border-primary shadow-lg' : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="px-3 py-1">Mais Popular</Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-6">
                {/* Preço */}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">R$ {(plan.price / 100).toLocaleString('pt-BR')}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Ou R$ {(plan.price / 12 / 100).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}/mês
                  </p>
                </div>

                {/* Benefícios */}
                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Botão */}
                <Button
                  className="w-full mt-6"
                  size="lg"
                  onClick={() => handleCheckout(plan.id)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processando...' : 'Continuar com Pagamento'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ e Informações */}
        <div className="bg-card border rounded-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold">Informações Importantes</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Teste Gratuito de 7 Dias</h3>
              <p className="text-sm text-muted-foreground">
                Todos os novos clientes têm acesso completo ao sistema por 7 dias sem custo. Após o período de teste,
                você deve escolher um plano para continuar usando o sistema.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Cancelamento Simples</h3>
              <p className="text-sm text-muted-foreground">
                Você pode cancelar sua assinatura a qualquer momento. Não há multas ou compromissos de longo prazo.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Módulo Fiscal</h3>
              <p className="text-sm text-muted-foreground">
                O módulo fiscal permite emitir notas fiscais (NFe/RPS) conforme obrigatoriedade da sua cidade. Integrado
                com Cibradi.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Pagamento Seguro</h3>
              <p className="text-sm text-muted-foreground">
                Todos os pagamentos são processados por Stripe, garantindo segurança e conformidade com PCI DSS.
              </p>
            </div>
          </div>
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-12 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Carregando...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}

