import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { t } from "@/lib/i18n/useTranslation"

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t.menu.assinaturas}</h1>
        <p className="text-muted-foreground">Gerencie planos de assinatura e clientes assinantes</p>
      </div>

      <Tabs defaultValue="planos" className="w-full">
        <TabsList>
          <TabsTrigger value="planos">{t.assinaturas.planos}</TabsTrigger>
          <TabsTrigger value="clientes">{t.assinaturas.clientes}</TabsTrigger>
        </TabsList>

        <TabsContent value="planos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.assinaturas.planos}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Nenhum plano criado ainda</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t.assinaturas.assinantesAtivos}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t.assinaturas.receita}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 0,00</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Cancelamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0%</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t.assinaturas.clientes}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Nenhum cliente com assinatura ativa</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
