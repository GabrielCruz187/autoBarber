'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'
import type { FiscalDashboardStats, FiscalInvoice } from '@/lib/fiscal/types'

const statusConfig = {
  pending: { label: 'Pendente', variant: 'outline', icon: Clock },
  authorized: { label: 'Autorizado', variant: 'default', icon: CheckCircle },
  rejected: { label: 'Rejeitado', variant: 'destructive', icon: XCircle },
  cancelled: { label: 'Cancelado', variant: 'secondary', icon: XCircle },
}

const invoiceTypeConfig = {
  nfse: { label: 'NFS-e', variant: 'outline' },
  nfe: { label: 'NF-e', variant: 'secondary' },
}

export function FiscalDashboard() {
  const [data, setData] = useState<{ stats: FiscalDashboardStats } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/fiscal/dashboard')
        if (!res.ok) throw new Error('Failed to load data')
        const result = await res.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !data?.stats) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar dados fiscais</AlertTitle>
        <AlertDescription>
          Não foi possível carregar as informações do painel fiscal. Tente novamente.
        </AlertDescription>
      </Alert>
    )
  }

  const stats = data.stats

  return (
    <div className="space-y-6">
      {stats.certificate_expiring_soon && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Certificado Expirando</AlertTitle>
          <AlertDescription>
            Seu certificado digital expira em {new Date(stats.certificate_expiring_soon.valid_until).toLocaleDateString('pt-BR')}. Renove-o para evitar interrupções.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_invoices}</div>
            <p className="text-xs text-muted-foreground">Todas as notas fiscais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Autorizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.invoices_by_status.authorized}</div>
            <p className="text-xs text-muted-foreground">Notas com sucesso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.total_revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Valor das notas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Impostos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.total_taxes.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">ISS, COFINS, PIS</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Notas por Tipo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">NFS-e</span>
              <span className="font-semibold">{stats.invoices_by_type.nfse}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">NF-e</span>
              <span className="font-semibold">{stats.invoices_by_type.nfe}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Pendentes</span>
              <span className="font-semibold text-yellow-600">{stats.invoices_by_status.pending}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Rejeitadas</span>
              <span className="font-semibold text-red-600">{stats.invoices_by_status.rejected}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Canceladas</span>
              <span className="font-semibold text-gray-600">{stats.invoices_by_status.cancelled}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.recent_invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Notas Recentes</CardTitle>
            <CardDescription>Últimas notas fiscais emitidas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recent_invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>
                        <Badge variant={invoiceTypeConfig[invoice.invoice_type].variant}>
                          {invoiceTypeConfig[invoice.invoice_type].label}
                        </Badge>
                      </TableCell>
                      <TableCell>{invoice.client_name}</TableCell>
                      <TableCell className="font-semibold">
                        R$ {invoice.total_amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[invoice.status].variant}>
                          {statusConfig[invoice.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(invoice.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
