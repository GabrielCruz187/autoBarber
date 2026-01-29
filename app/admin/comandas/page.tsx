import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { t } from "@/lib/i18n/useTranslation"
import { Plus } from "lucide-react"

export default async function ComandasPage() {
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

  const { data: comandas } = await supabase
    .from("comandas")
    .select(`
      *,
      cliente:clients(id, first_name, last_name)
    `)
    .eq("barbershop_id", profile.barbershop_id)
    .order("data_abertura", { ascending: false })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.menu.comandas}</h1>
          <p className="text-muted-foreground">Controle de comandas vinculadas aos clientes</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t.comandas.novaComanda}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t.comandas.totalComandasAbertas}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {comandas?.filter(c => c.status === 'aberta').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Total em Aberto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                comandas
                  ?.filter(c => c.status === 'aberta')
                  .reduce((sum, c) => sum + (c.total || 0), 0) || 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t.comandas.comandasPagas}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {comandas?.filter(c => c.status === 'paga').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.comandas.listaComandas}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>{t.comandas.cliente}</TableHead>
                <TableHead>{t.comandas.data}</TableHead>
                <TableHead>{t.comandas.itens}</TableHead>
                <TableHead>{t.comandas.total}</TableHead>
                <TableHead>{t.comandas.statusComanda}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comandas?.map((comanda: any) => (
                <TableRow key={comanda.id}>
                  <TableCell className="font-mono text-xs">{comanda.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    {comanda.cliente 
                      ? `${comanda.cliente.first_name} ${comanda.cliente.last_name}`
                      : t.common.semCliente
                    }
                  </TableCell>
                  <TableCell>{new Date(comanda.data_abertura).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell className="font-bold">{formatCurrency(comanda.total)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      comanda.status === 'aberta' ? 'default' :
                      comanda.status === 'paga' ? 'secondary' :
                      'destructive'
                    }>
                      {comanda.status === 'aberta' ? t.comandas.aberta :
                       comanda.status === 'paga' ? t.comandas.paga :
                       t.comandas.cancelada}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
