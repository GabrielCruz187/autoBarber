import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { t } from "@/lib/i18n/useTranslation"
import { Plus } from "lucide-react"

export default async function CaixaPage() {
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

  const { data: caixas } = await supabase
    .from("caixas")
    .select("*")
    .eq("barbershop_id", profile.barbershop_id)
    .order("data_abertura", { ascending: false })

  const caixaAberta = caixas?.find(c => c.status === 'aberto')

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
          <h1 className="text-3xl font-bold">{t.menu.caixa}</h1>
          <p className="text-muted-foreground">Controle de abertura e fechamento de caixa</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {caixaAberta ? t.caixa.fecharCaixa : t.caixa.abrirCaixa}
        </Button>
      </div>

      {caixaAberta && (
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-300">Caixa Aberto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">{t.caixa.saldoInicial}</p>
                <p className="text-lg font-bold">{formatCurrency(caixaAberta.saldo_inicial)}</p>
              </div>
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">{t.caixa.totalEntradas}</p>
                <p className="text-lg font-bold">{formatCurrency(caixaAberta.total_entradas)}</p>
              </div>
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">{t.caixa.totalSaidas}</p>
                <p className="text-lg font-bold">{formatCurrency(caixaAberta.total_saidas)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t.caixa.historicoCaixa}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.caixa.dataabertura}</TableHead>
                <TableHead>{t.caixa.dataFechamento}</TableHead>
                <TableHead>{t.caixa.saldoInicial}</TableHead>
                <TableHead>{t.caixa.totalEntradas}</TableHead>
                <TableHead>{t.caixa.totalSaidas}</TableHead>
                <TableHead>{t.caixa.saldoFinal}</TableHead>
                <TableHead>{t.caixa.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {caixas?.map((caixa) => (
                <TableRow key={caixa.id}>
                  <TableCell>{new Date(caixa.data_abertura).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    {caixa.data_fechamento 
                      ? new Date(caixa.data_fechamento).toLocaleDateString('pt-BR')
                      : '-'
                    }
                  </TableCell>
                  <TableCell>{formatCurrency(caixa.saldo_inicial)}</TableCell>
                  <TableCell>{formatCurrency(caixa.total_entradas)}</TableCell>
                  <TableCell>{formatCurrency(caixa.total_saidas)}</TableCell>
                  <TableCell>{caixa.saldo_final ? formatCurrency(caixa.saldo_final) : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={caixa.status === 'aberto' ? 'default' : 'secondary'}>
                      {caixa.status === 'aberto' ? t.caixa.aberto : t.caixa.fechado}
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
