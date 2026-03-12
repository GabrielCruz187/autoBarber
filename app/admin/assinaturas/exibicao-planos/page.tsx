import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function ExibicaoPlanosPage() {
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
    .order("preco", { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Exibição de Planos</h1>
        <p className="text-muted-foreground">Visualize como os planos aparecem para os clientes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {planos && planos.length > 0 ? (
          planos.map((plano: any) => (
            <Card key={plano.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plano.nome}
                  {plano.destaque && <Badge>Destaque</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div>
                  <div className="text-3xl font-bold">
                    R$ {plano.preco.toFixed(2)}
                    <span className="text-lg text-muted-foreground font-normal">/mês</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{plano.descricao}</p>
                <Button className="w-full">Assinar Agora</Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nenhum plano ativo para exibição
          </div>
        )}
      </div>
    </div>
  )
}
