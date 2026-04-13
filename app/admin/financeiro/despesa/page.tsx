import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function DespesasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("barbershop_id")
    .eq("id", user.id)
    .single()

  if (!profile?.barbershop_id) {
    redirect("/onboarding")
  }

  const barbershopId = profile.barbershop_id

  // Fetch expenses from Supabase
  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("barbershop_id", barbershopId)
    .order("due_date", { ascending: false })

  const totalPending = expenses?.reduce(
    (sum: number, e: any) => (e.status === "pending" ? sum + e.amount : sum),
    0
  ) || 0

  const totalPaid = expenses?.reduce(
    (sum: number, e: any) => (e.status === "paid" ? sum + e.amount : sum),
    0
  ) || 0

  const total = expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0

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

      {/* Expenses Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!expenses || expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhuma despesa encontrada
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense: any) => (
                <TableRow key={expense.id} className="hover:bg-muted/50">
                  <TableCell className="font-semibold">{expense.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{expense.category}</TableCell>
                  <TableCell className="text-right">R$ {expense.amount.toFixed(2)}</TableCell>
                  <TableCell>{format(new Date(expense.due_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    {expense.status === "paid" ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        Pago
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                        Pendente
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Link href={`/admin/financeiro/despesa/${expense.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}



