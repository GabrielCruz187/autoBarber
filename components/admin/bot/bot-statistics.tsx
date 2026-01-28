'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Stats {
  totalMessages: number
  inboundCount: number
  outboundCount: number
  uniqueCustomers: number
  conversationsActive: number
  appointmentsCreated: number
}

export function BotStatistics() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/bot/statistics')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('[v0] Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>
  }

  if (!stats) {
    return <div className="text-center py-12 text-muted-foreground">Sem dados disponíveis</div>
  }

  const cards = [
    { label: 'Total de Mensagens', value: stats.totalMessages },
    { label: 'Mensagens Recebidas', value: stats.inboundCount },
    { label: 'Mensagens Enviadas', value: stats.outboundCount },
    { label: 'Clientes Únicos', value: stats.uniqueCustomers },
    { label: 'Conversas Ativas', value: stats.conversationsActive },
    { label: 'Agendamentos Criados', value: stats.appointmentsCreated },
  ]

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo de Performance</CardTitle>
          <CardDescription>
            Métricas do seu bot WhatsApp de hoje
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">Taxa de Conversão</span>
              <span className="text-sm font-medium">
                {stats.uniqueCustomers > 0
                  ? ((stats.appointmentsCreated / stats.uniqueCustomers) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">Mensagens por Conversa</span>
              <span className="text-sm font-medium">
                {stats.conversationsActive > 0
                  ? (stats.totalMessages / stats.conversationsActive).toFixed(1)
                  : 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm">Taxa de Resposta</span>
              <span className="text-sm font-medium">
                {stats.totalMessages > 0
                  ? ((stats.outboundCount / stats.totalMessages) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
