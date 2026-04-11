'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface BarberPerformance {
  barber_id: string
  barber_name: string
  total_appointments: number
  total_revenue: number
  commission: number
  average_rating: number
}

interface CommissionTableProps {
  performances: BarberPerformance[]
  loading: boolean
}

export function CommissionTable({ performances, loading }: CommissionTableProps) {
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

  const totalRevenue = performances.reduce((sum, p) => sum + p.total_revenue, 0)
  const totalCommission = performances.reduce((sum, p) => sum + p.commission, 0)
  const totalAppointments = performances.reduce((sum, p) => sum + p.total_appointments, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tabela de Comissões</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">Faturamento Total</p>
              <p className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">Comissão Total</p>
              <p className="text-2xl font-bold">R$ {totalCommission.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">Total Atendimentos</p>
              <p className="text-2xl font-bold">{totalAppointments}</p>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barbeiro</TableHead>
                  <TableHead className="text-right">Atendimentos</TableHead>
                  <TableHead className="text-right">Faturamento</TableHead>
                  <TableHead className="text-right">% do Total</TableHead>
                  <TableHead className="text-right">Comissão (50%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performances.map((perf) => {
                  const percentage = totalRevenue > 0 
                    ? ((perf.total_revenue / totalRevenue) * 100).toFixed(1)
                    : '0'
                  
                  return (
                    <TableRow key={perf.barber_id}>
                      <TableCell className="font-medium">
                        {perf.barber_name}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{perf.total_appointments}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        R$ {perf.total_revenue.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{percentage}%</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        R$ {perf.commission.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              💡 Política de Comissão
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
              Cada barbeiro recebe 50% do faturamento dos seus agendamentos como comissão. O valor é calculado automaticamente baseado nos preços dos serviços.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
