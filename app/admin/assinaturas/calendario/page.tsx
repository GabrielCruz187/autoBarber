import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function CalendarioPage() {
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
        <h1 className="text-3xl font-bold">Calendário de Assinaturas</h1>
        <p className="text-muted-foreground">Visualize datas de renovação e cobrança</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eventos de Assinatura</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Calendário de eventos será exibido aqui</p>
              <p className="text-sm text-muted-foreground">
                Mostrando dias de renovação, cobrança e assinaturas ativas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
