'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface BarberPerformance {
  barber_id: string
  barber_name: string
  total_appointments: number
  total_revenue: number
  commission: number
  average_rating: number
}

interface PerformanceChartsProps {
  performances: BarberPerformance[]
  loading: boolean
}

const COLORS = ['#0ea5e9', '#f97316', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

export function PerformanceCharts({ performances, loading }: PerformanceChartsProps) {
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

  const chartData = performances.map((perf) => ({
    name: perf.barber_name.split(' ')[0],
    appointments: perf.total_appointments,
    revenue: perf.total_revenue,
    commission: perf.commission,
  }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Faturamento por Barbeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) =>
                  `R$ ${typeof value === 'number' ? value.toFixed(2) : value}`
                }
              />
              <Bar dataKey="revenue" fill="#0ea5e9" name="Faturamento" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Atendimentos Realizados</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${value} atendimentos`} />
              <Line
                type="monotone"
                dataKey="appointments"
                stroke="#10b981"
                strokeWidth={2}
                name="Atendimentos"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comissões (Proporcional)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="commission"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) =>
                  `R$ ${typeof value === 'number' ? value.toFixed(2) : value}`
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
