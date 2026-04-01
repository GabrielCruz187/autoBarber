import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function ClientesPage() {
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

  const { data: clients } = await supabase
    .from("clients")
    .select(`
      *,
      subscription_plan:planos_assinatura(nome, preco)
    `)
    .eq("barbershop_id", profile.barbershop_id)
    .order("created_at", { ascending: false })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assinante':
        return <div className="w-3 h-3 rounded-full bg-orange-500" title="Assinante" />
      case 'atrasado':
        return <div className="w-3 h-3 rounded-full bg-red-500" title="Pagamento Atrasado" />
      default:
        return <div className="w-3 h-3 rounded-full bg-green-500" title="Não Assinante" />
    }
  }

  const formatCPF = (cpf: string) => {
    if (!cpf) return '-'
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clientes</h1>
        <p className="text-muted-foreground">Gerenciamento de clientes cadastrados</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assinantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients?.filter(c => c.subscription_status === 'assinante').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Atrasados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {clients?.filter(c => c.subscription_status === 'atrasado').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Status</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Plano de Assinatura</TableHead>
                <TableHead>Status de Assinatura</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients?.map((client: any) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {getStatusBadge(client.subscription_status)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {client.first_name} {client.last_name}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {client.phone}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {formatCPF(client.cpf)}
                  </TableCell>
                  <TableCell>
                    {client.subscription_plan ? (
                      <div className="text-sm">
                        <p className="font-semibold">{client.subscription_plan.nome}</p>
                        <p className="text-muted-foreground">
                          R$ {client.subscription_plan.preco.toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        client.subscription_status === 'assinante'
                          ? 'default'
                          : client.subscription_status === 'atrasado'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {client.subscription_status === 'assinante'
                        ? 'Assinante'
                        : client.subscription_status === 'atrasado'
                        ? 'Atrasado'
                        : 'Não Assinante'}
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
