'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { useParams } from 'next/navigation'

export default function DespesasPage() {
  const params = useParams()
  const barbershopId = typeof params.id === 'string' ? params.id : ''
  const { toast } = useToast()

  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPending, setTotalPending] = useState(0)
  const [totalPaid, setTotalPaid] = useState(0)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!barbershopId) return

      try {
        setLoading(true)
        const url = `/api/admin/despesas?barbershopId=${barbershopId}${statusFilter ? `&status=${statusFilter}` : ''}`
        const response = await fetch(url)
        const result = await response.json()

        if (result.error) {
          toast({
            title: 'Aviso',
            description: result.error,
            variant: 'default',
          })
          setExpenses([])
        } else {
          setExpenses(result.expenses || [])
          setTotalPending(result.totalPending || 0)
          setTotalPaid(result.totalPaid || 0)
          setTotal(result.total || 0)
        }
      } catch (error) {
        console.error('[v0] Erro ao buscar despesas:', error)
        toast({
          title: 'Erro',
          description: 'Falha ao buscar despesas',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
  }, [barbershopId, statusFilter, toast])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta despesa?')) return

    try {
      const response = await fetch(`/api/admin/despesas?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Falha ao deletar')

      setExpenses(expenses.filter((e) => e.id !== id))
      toast({
        title: 'Sucesso',
        description: 'Despesa deletada com sucesso',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao deletar despesa',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' },
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Pago' },
    }

    const badge = badges[status] || badges.pending
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>{badge.label}</span>
  }
   

  const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.finalAmount, 0)
  const paidExpenses = expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.finalAmount, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.finalAmount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Despesas</h1>
          <p className="text-muted-foreground mt-2">Gerencie todas as despesas da barbearia</p>
        </div>
        <Link href="/admin/financeiro/despesa/criar">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Despesa
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <p className="text-sm text-muted-foreground">Pendente</p>
          <p className="text-3xl font-bold text-yellow-900 mt-2">R$ {totalPending.toFixed(2)}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <p className="text-sm text-muted-foreground">Pago</p>
          <p className="text-3xl font-bold text-green-900 mt-2">R$ {totalPaid.toFixed(2)}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">R$ {total.toFixed(2)}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Filtrar por Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md text-sm"
            >
              <option value="">Todos</option>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Expenses Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground">Nenhuma despesa encontrada</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Com Ajuste</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense: any) => (
                <TableRow key={expense.id} className="hover:bg-muted/50">
                  <TableCell className="font-semibold">{expense.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{expense.category}</TableCell>
                  <TableCell className="text-right">R$ {expense.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    R$ {((expense.amount || 0) - (expense.discount || 0) + (expense.interest || 0)).toFixed(2)}
                  </TableCell>
                  <TableCell>{format(new Date(expense.due_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{getStatusBadge(expense.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Link href={`/admin/financeiro/despesa/${expense.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(expense.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}

