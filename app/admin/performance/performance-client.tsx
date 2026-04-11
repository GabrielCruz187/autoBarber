'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarberRanking } from '@/components/admin/performance/barber-ranking'
import { PerformanceCharts } from '@/components/admin/performance/performance-charts'
import { CommissionTable } from '@/components/admin/performance/commission-table'
import { TrendingUp, Trophy, DollarSign } from 'lucide-react'

interface BarberPerformance {
  barber_id: string
  barber_name: string
  total_appointments: number
  total_revenue: number
  commission: number
  average_rating: number
}

export function PerformanceClient() {
  const [performances, setPerformances] = useState<BarberPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    fetchPerformanceData()
  }, [timeRange])

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/barber-performance?range=${timeRange}`)
      const data = await response.json()
      setPerformances(data)
    } catch (error) {
      console.error('[v0] Erro ao buscar performance:', error)
    } finally {
      setLoading(false)
    }
  }

  const topBarber = performances[0]
  const totalRevenue = performances.reduce((sum, p) => sum + p.total_revenue, 0)
  const totalAppointments = performances.reduce((sum, p) => sum + p.total_appointments, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Performance de Barbeiros</h1>
        <p className="text-muted-foreground">
          Acompanhe a produtividade e desempenho de cada barbeiro
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Melhor Barbeiro</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topBarber?.barber_name || '-'}</div>
            <p className="text-xs text-muted-foreground">
              {topBarber?.total_appointments || 0} atendimentos este período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {totalAppointments} atendimentos no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Período</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {(['week', 'month', 'year'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`text-xs px-2 py-1 rounded ${
                    timeRange === range
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {range === 'week' ? 'Semana' : range === 'month' ? 'Mês' : 'Ano'}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ranking" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="commission">Comissões</TabsTrigger>
        </TabsList>

        <TabsContent value="ranking">
          <BarberRanking performances={performances} loading={loading} />
        </TabsContent>

        <TabsContent value="charts">
          <PerformanceCharts performances={performances} loading={loading} />
        </TabsContent>

        <TabsContent value="commission">
          <CommissionTable performances={performances} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
