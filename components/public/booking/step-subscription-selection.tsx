'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronRight } from 'lucide-react'

interface StepSubscriptionSelectionProps {
  plans: any[]
  selectedPlan: string | null
  onSelect: (planId: string | null) => void
  onBack: () => void
}

export function StepSubscriptionSelection({
  plans,
  selectedPlan,
  onSelect,
  onBack,
}: StepSubscriptionSelectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Você é assinante?</h2>
        <p className="text-muted-foreground">
          Selecione se você possui algum plano de assinatura
        </p>
      </div>

      <div className="space-y-3">
        {/* Não assinante */}
        <Card
          className={`cursor-pointer transition-all ${
            selectedPlan === null
              ? 'border-primary bg-primary/5'
              : 'hover:border-primary/50'
          }`}
          onClick={() => onSelect(null)}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Não sou assinante</p>
                <p className="text-sm text-muted-foreground">
                  Marcar horário pontuais
                </p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 transition-all ${
                  selectedPlan === null
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground'
                }`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Planos de assinatura */}
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`cursor-pointer transition-all ${
              selectedPlan === plan.id
                ? 'border-primary bg-primary/5'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onSelect(plan.id)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{plan.nome}</p>
                    <Badge variant="secondary">
                      R$ {plan.preco.toFixed(2)}
                    </Badge>
                  </div>
                  {plan.descricao && (
                    <p className="text-sm text-muted-foreground">
                      {plan.descricao}
                    </p>
                  )}
                  {plan.servicos_inclusos && (
                    <p className="text-sm font-medium text-primary">
                      {plan.servicos_inclusos} serviços inclusos
                    </p>
                  )}
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    selectedPlan === plan.id
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground'
                  }`}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button onClick={() => {}} className="flex-1 gap-2">
          Continuar
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}