import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { t } from "@/lib/i18n/useTranslation"

export default async function RelatoriosPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t.menu.relatorios}</h1>
        <p className="text-muted-foreground">Visualize relatórios detalhados do seu negócio</p>
      </div>

      <Tabs defaultValue="financeiro" className="w-full">
        <TabsList>
          <TabsTrigger value="financeiro">{t.relatorios.relatorioFinanceiro}</TabsTrigger>
          <TabsTrigger value="vendas">{t.relatorios.relatorioVendas}</TabsTrigger>
          <TabsTrigger value="clientes">{t.relatorios.relatorioClientes}</TabsTrigger>
          <TabsTrigger value="faturamento">{t.relatorios.relatorioFaturamento}</TabsTrigger>
        </TabsList>

        <TabsContent value="financeiro" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.relatorios.relatorioFinanceiro}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Resumo financeiro do período</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.relatorios.relatorioVendas}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Análise de vendas e serviços prestados</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.relatorios.relatorioClientes}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Clientes recorrentes e satisfação</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faturamento" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.relatorios.relatorioFaturamento}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Faturamento por barbeiro e período</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
