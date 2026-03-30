'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'

interface SubscriptionPlan {
  id: string
  nome: string
  descricao: string | null
  preco: number
  servicos_inclusos: number | null
  beneficios: string[] | null
}

export function SubscriptionPlansSection({ plans }: { plans: SubscriptionPlan[] }) {
  if (!plans || plans.length === 0) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Planos de Assinatura</h2>
        <p className="text-muted-foreground mt-2">Economize com nossos planos mensais</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>{plan.nome}</CardTitle>
                  {plan.descricao && (
                    <CardDescription className="mt-2">{plan.descricao}</CardDescription>
                  )}
                </div>
              </div>
              <div className="pt-4">
                <div className="text-3xl font-bold">
                  R$ {(plan.preco).toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">por mês</p>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col gap-6">
              {plan.servicos_inclusos && (
                <div className="space-y-2">
                  <Badge variant="secondary">
                    {plan.servicos_inclusos} serviços inclusos
                  </Badge>
                </div>
              )}

              {plan.beneficios && plan.beneficios.length > 0 && (
                <ul className="space-y-3">
                  {plan.beneficios.map((beneficio, idx) => (
                    <li key={idx} className="flex gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{beneficio}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-auto pt-4">
                <button className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:opacity-90 transition-opacity">
                  Escolher Plano
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
