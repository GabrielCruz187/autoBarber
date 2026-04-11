'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Medal, TrendingUp } from 'lucide-react'

interface BarberPerformance {
  barber_id: string
  barber_name: string
  total_appointments: number
  total_revenue: number
  commission: number
  average_rating: number
}

interface BarberRankingProps {
  performances: BarberPerformance[]
  loading: boolean
}

export function BarberRanking({ performances, loading }: BarberRankingProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (!performances.length) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Nenhum dado de performance disponível
        </CardContent>
      </Card>
    )
  }

  const getMedalColor = (position: number) => {
    if (position === 0) return 'text-yellow-600'
    if (position === 1) return 'text-gray-400'
    if (position === 2) return 'text-orange-600'
    return 'text-muted-foreground'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking de Barbeiros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {performances.map((perf, idx) => (
            <div
              key={perf.barber_id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center justify-center w-10">
                  <Medal className={`h-6 w-6 ${getMedalColor(idx)}`} />
                </div>
                <div>
                  <h3 className="font-semibold">{perf.barber_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {perf.total_appointments} atendimentos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="font-bold text-lg">
                    R$ {perf.total_revenue.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">Faturamento</p>
                </div>

                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold">
                    #{idx + 1}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
