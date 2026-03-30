'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExternalLink, Star, Users, TrendingUp } from 'lucide-react'

export default function GamificationPage() {
  const gamificationAppUrl = 'https://seu-app-gamificacao.com'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Programa de Gamificação</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Engaje seus clientes com um sistema de pontos e recompensas
        </p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Star className="h-6 w-6 text-yellow-500" />
            Sobre o App de Gamificação
          </CardTitle>
          <CardDescription>
            Um aplicativo completo e independente para gerenciar pontos de clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-base">O que é?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                O app de gamificação é uma aplicação integrada e pronta para usar que permite seus clientes acumularem pontos a cada agendamento, visualizarem seu saldo, competirem no ranking e resgatarem recompensas exclusivas.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-base">Recursos Principais</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex gap-2">
                  <Users className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-600" />
                  <span>Gestão de pontos por cliente</span>
                </li>
                <li className="flex gap-2">
                  <TrendingUp className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-600" />
                  <span>Ranking competitivo de clientes</span>
                </li>
                <li className="flex gap-2">
                  <Star className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-600" />
                  <span>Sistema de recompensas e resgate</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium mb-2">✓ App Pronto para Usar</p>
            <p className="text-xs text-blue-800">
              Este é um aplicativo completo e independente já desenvolvido. Basta você conectar seu link e começar a usar!
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ativar App de Gamificação</CardTitle>
          <CardDescription>
            Se deseja ativar o programa de gamificação para sua barbearia, coloque o link do app abaixo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">URL do App de Gamificação</label>
            <div className="flex gap-2">
              <Input
                placeholder="https://seu-app-gamificacao.com"
                defaultValue={gamificationAppUrl}
                disabled
                className="bg-muted"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (gamificationAppUrl !== 'https://seu-app-gamificacao.com') {
                    window.open(gamificationAppUrl, '_blank')
                  }
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Cole o link do seu app de gamificação aqui. Seus clientes serão redirecionados para este endereço.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-green-900">Como Funciona a Integração</p>
            <ol className="text-xs text-green-800 space-y-2 list-decimal list-inside">
              <li>Seus clientes acessam o app através do link que você configurar</li>
              <li>Cada vez que fazem um agendamento, ganham pontos automaticamente</li>
              <li>Podem visualizar seu saldo e histórico de pontos no app</li>
              <li>Resgatam prêmios e descontos usando seus pontos</li>
              <li>Competem no ranking com outros clientes da sua barbearia</li>
            </ol>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs font-medium text-amber-900 mb-2">Benefícios para Clientes</p>
              <ul className="text-xs text-amber-800 space-y-1">
                <li>• Ganham pontos com cada serviço</li>
                <li>• Resgatam prêmios exclusivos</li>
                <li>• Acompanham progresso em tempo real</li>
                <li>• Participam de competições</li>
              </ul>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs font-medium text-purple-900 mb-2">Benefícios para Você</p>
              <ul className="text-xs text-purple-800 space-y-1">
                <li>• Aumenta frequência de clientes</li>
                <li>• Maior engajamento e fidelização</li>
                <li>• Dados sobre preferências dos clientes</li>
                <li>• Marketing integrado ao app</li>
              </ul>
            </div>
          </div>

          <Button className="w-full" size="lg">
            Ativar Gamificação
          </Button>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Precisa de Mais Informações?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Entre em contato conosco para saber como integrar completamente seu app de gamificação com a plataforma de agendamentos.
          </p>
          <Button variant="outline" className="w-full">
            Falar com Suporte
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
