'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Card } from '@/components/ui/card'
import { TrendingUp, DollarSign, Percent } from 'lucide-react'

interface RevenueMetricsProps {
  dailyRevenue: Array<{ date: string; revenue: number }>
  monthlyRevenue: Array<{ month: string; revenue: number }>
  topServices: Array<{ name: string; count: number; revenue: number }>
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function RevenueMetrics({ dailyRevenue, monthlyRevenue, topServices }: RevenueMetricsProps) {
  const totalMonthlyRevenue = monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0)
  const avgDailyRevenue = dailyRevenue.length > 0 
    ? dailyRevenue.reduce((sum, item) => sum + item.revenue, 0) / dailyRevenue.length 
    : 0

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Faturamento do Mês</p>
              <p className="text-2xl font-bold mt-2">R$ {totalMonthlyRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="w-5 h-5 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Média Diária</p>
              <p className="text-2xl font-bold mt-2">R$ {avgDailyRevenue.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Serviços</p>
              <p className="text-2xl font-bold mt-2">{topServices.reduce((sum, s) => sum + s.count, 0)}</p>
            </div>
            <Percent className="w-5 h-5 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Revenue Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Faturamento Diário</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
                contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Services Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Serviços Mais Vendidos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topServices}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => `${value}`}
                contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
              />
              <Bar dataKey="count" fill="#10b981" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Faturamento Mensal</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
              contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#f59e0b" name="Faturamento" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
