import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { t } from "@/lib/i18n/useTranslation"
import { Plus, TrendingUp } from "lucide-react"

export default async function AssinaturasPage() {
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

  const { data: planos } = await supabase
    .from("planos_assinatura")
    .select("*")
    .eq("barbershop_id", profile.barbershop_id)
    .eq("ativo", true)
    .order("preco")

  const { data: assinaturas } = await supabase
    .from("assinaturas_clientes")
    .select(`
      *,
      cliente:clients(id, first_name, last_name),
      plano:planos_assinatura(id, nome, preco)
    `)
    .eq("barbershop_id", profile.barbershop_id)
    .order("data_inicio", { ascending: false })

  const { data: relatorio } = await supabase
    .from("relatorios_assinaturas")
    .select("*")
    .eq("barbershop_id", profile.barbershop_id)
    .order("data_relatorio", { ascending: false })
    .limit(1)
    .single()

  const assinaturasAativas = assinaturas?.filter(a => a.status === 'ativa').length || 0
  const receitaMensal = planos?.reduce((sum, p) => {
    const count = assinaturas?.filter(a => a.plano_id === p.id && a.status === 'ativa').length || 0
    return sum + (p.preco * count)
  }, 0) || 0

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
          <h1 className="text-3xl font-bold">{t.menu.assinaturas}</h1>
          <p className="text-muted-foreground">Gerenciamento de planos e assinantes</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assinantes Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assinaturasAativas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              Receita Mensal
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(receitaMensal)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Planos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planos?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(receitaMensal / Math.max(assinaturasAativas, 1))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="planos" className="w-full">
        <TabsList>
          <TabsTrigger value="planos">Planos</TabsTrigger>
          <TabsTrigger value="assinantes">Assinantes</TabsTrigger>
        </TabsList>

        <TabsContent value="planos">
          <Card>
            <CardHeader>
              <CardTitle>Planos de Assinatura</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Assinantes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planos?.map((plano) => {
                    const count = assinaturas?.filter(a => a.plano_id === plano.id && a.status === 'ativa').length || 0
                    return (
                      <TableRow key={plano.id}>
                        <TableCell className="font-medium">{plano.nome}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{plano.descricao}</TableCell>
                        <TableCell className="font-bold">{formatCurrency(plano.preco)}</TableCell>
                        <TableCell>{plano.duracao_dias} dias</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{count}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assinantes">
          <Card>
            <CardHeader>
              <CardTitle>Clientes Assinantes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Data Início</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assinaturas?.map((assinatura: any) => (
                    <TableRow key={assinatura.id}>
                      <TableCell>
                        {assinatura.cliente 
                          ? `${assinatura.cliente.first_name} ${assinatura.cliente.last_name}`
                          : '-'
                        }
                      </TableCell>
                      <TableCell>{assinatura.plano?.nome}</TableCell>
                      <TableCell>
                        {new Date(assinatura.data_inicio).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {new Date(assinatura.data_vencimento).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          assinatura.status === 'ativa' ? 'default' :
                          assinatura.status === 'expirada' ? 'secondary' :
                          'destructive'
                        }>
                          {assinatura.status === 'ativa' ? 'Ativa' :
                           assinatura.status === 'expirada' ? 'Expirada' :
                           'Cancelada'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
