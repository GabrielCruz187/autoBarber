'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DollarSign, Download, Send, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useParams } from 'next/navigation'

export default function ComissoesPage() {
  const params = useParams()
  const barbershopId = typeof params.id === 'string' ? params.id : ''
  const { toast } = useToast()
  
  const [startDate, setStartDate] = useState(format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selected, setSelected] = useState<string[]>([])
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCommission, setTotalCommission] = useState(0)
  const [totalPending, setTotalPending] = useState(0)

  useEffect(() => {
    const fetchCommissions = async () => {
      if (!barbershopId) return
      
      try {
        setLoading(true)
        const response = await fetch(
          `/api/admin/comissoes?barbershopId=${barbershopId}&startDate=${startDate}&endDate=${endDate}`
        )
        const result = await response.json()

        if (result.error) {
          toast({
            title: 'Aviso',
            description: result.error,
            variant: 'default',
          })
          setData([])
        } else {
          setData(result.barbers || [])
          setTotalCommission(result.totalCommission || 0)
          setTotalPending(result.totalPending || 0)
        }
      } catch (error) {
        console.error('[v0] Erro ao buscar comissões:', error)
        toast({
          title: 'Erro',
          description: 'Falha ao buscar comissões',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCommissions()
  }, [startDate, endDate, barbershopId])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(data.map((b) => b.barberId))
    } else {
      setSelected([])
    }
  }

  const handleSelectBarber = (barberId: string, checked: boolean) => {
    if (checked) {
      setSelected([...selected, barberId])
    } else {
      setSelected(selected.filter((id) => id !== barberId))
    }
  }

  const selectedTotal = data
    .filter((b) => selected.includes(b.barberId))
    .reduce((sum, b) => sum + b.totalCommission, 0)

  const handleGenerateMovement = async () => {
    if (selected.length === 0) return

    try {
      // This would send to a payment processing API
      toast({
        title: 'Sucesso',
        description: `Movimentação gerada para ${selected.length} barbeiro(s)`,
      })
      setSelected([])
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao gerar movimentação',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Comissões dos Barbeiros</h1>
        <p className="text-muted-foreground mt-2">Acompanhe as comissões geradas por cada barbeiro no período</p>
      </div>

      {/* Date Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Data Inicial</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Data Final</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-3xl font-bold text-blue-900">R$ {totalCommission.toFixed(2)}</p>
            </div>
            <DollarSign className="h-12 w-12 text-blue-500 opacity-30" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pendente</p>
              <p className="text-3xl font-bold text-yellow-900">R$ {totalPending.toFixed(2)}</p>
            </div>
            <DollarSign className="h-12 w-12 text-yellow-500 opacity-30" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Selecionado</p>
              <p className="text-3xl font-bold text-green-900">R$ {selectedTotal.toFixed(2)}</p>
            </div>
            <DollarSign className="h-12 w-12 text-green-500 opacity-30" />
          </div>
        </Card>
      </div>

      {/* Commissions Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground">Nenhuma comissão encontrada para o período selecionado</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selected.length === data.length && data.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Barbeiro</TableHead>
                <TableHead className="text-right">Serviços</TableHead>
                <TableHead className="text-right">Assinatura</TableHead>
                <TableHead className="text-right">Produtos</TableHead>
                <TableHead className="text-right">Bônus</TableHead>
                <TableHead className="text-right">Vales</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((barber: any) => (
                <TableRow key={barber.barberId} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selected.includes(barber.barberId)}
                      onCheckedChange={(checked) =>
                        handleSelectBarber(barber.barberId, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-semibold">{barber.barberName}</TableCell>
                  <TableCell className="text-right">R$ {barber.services.toFixed(2)}</TableCell>
                  <TableCell className="text-right">R$ {(barber.subscription || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right">R$ {(barber.products || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right">R$ {(barber.bonus || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right">R$ {(barber.vouchers || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right font-bold text-blue-600">
                    R$ {barber.totalCommission.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
        <Button
          className="gap-2"
          onClick={handleGenerateMovement}
          disabled={selected.length === 0 || loading}
        >
          <Send className="h-4 w-4" />
          Gerar Movimentação ({selected.length})
        </Button>
      </div>
    </div>
  )
}


