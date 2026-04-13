import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { DollarSign, Download, Send } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function ComissoesPage() {
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

  // Get all completed appointments for commission calculation
  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, barber_id, total_price, status")
    .eq("barbershop_id", barbershopId)
    .eq("status", "completed")

  // Get barbers
  const { data: barbers } = await supabase
    .from("barbers")
    .select("id, first_name, last_name")
    .eq("barbershop_id", barbershopId)

  // Calculate commissions
  const commissionsMap: Record<string, any> = {}
  barbers?.forEach(barber => {
    commissionsMap[barber.id] = {
      barberId: barber.id,
      barberName: `${barber.first_name} ${barber.last_name}`,
      services: 0,
      totalCommission: 0,
    }
  })

  appointments?.forEach(apt => {
    if (apt.barber_id && commissionsMap[apt.barber_id]) {
      commissionsMap[apt.barber_id].services += (apt.total_price || 0)
    }
  })

  // Calculate 50% commission
  Object.values(commissionsMap).forEach((c: any) => {
    c.totalCommission = c.services * 0.5
  })

  const commissions = Object.values(commissionsMap).sort((a: any, b: any) => b.totalCommission - a.totalCommission)
  const totalCommission = commissions.reduce((sum: number, c: any) => sum + c.totalCommission, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Comissões dos Barbeiros</h1>
        <p className="text-muted-foreground mt-2">Acompanhe as comissões geradas (50% do faturamento)</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Comissões</p>
              <p className="text-3xl font-bold text-blue-900">R$ {totalCommission.toFixed(2)}</p>
            </div>
            <DollarSign className="h-12 w-12 text-blue-500 opacity-30" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <p className="text-sm text-muted-foreground">Total Faturado</p>
          <p className="text-3xl font-bold text-yellow-900">R$ {(totalCommission * 2).toFixed(2)}</p>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <p className="text-sm text-muted-foreground">Barbeiros Ativos</p>
          <p className="text-3xl font-bold text-green-900">{commissions.length}</p>
        </Card>
      </div>

      {/* Commissions Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>Posição</TableHead>
              <TableHead>Barbeiro</TableHead>
              <TableHead className="text-right">Faturamento</TableHead>
              <TableHead className="text-right">Comissão (50%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Nenhuma comissão para exibir
                </TableCell>
              </TableRow>
            ) : (
              commissions.map((barber: any, idx: number) => (
                <TableRow key={barber.barberId} className="hover:bg-muted/50">
                  <TableCell className="font-bold text-lg">#{idx + 1}</TableCell>
                  <TableCell className="font-semibold">{barber.barberName}</TableCell>
                  <TableCell className="text-right">R$ {barber.services.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-bold text-blue-600">
                    R$ {barber.totalCommission.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
        <Button className="gap-2">
          <Send className="h-4 w-4" />
          Gerar Movimentação
        </Button>
      </div>
    </div>
  )
}




