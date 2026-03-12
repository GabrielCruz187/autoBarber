import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

export default async function CriarPlanosPage() {
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
        <h1 className="text-3xl font-bold">Criar Plano de Assinatura</h1>
        <p className="text-muted-foreground">Adicione um novo plano de assinatura</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label>Nome do Plano</Label>
                <Input placeholder="Ex: Plano Premium" />
              </div>
              <div>
                <Label>Preço Mensal</Label>
                <Input type="number" placeholder="0.00" step="0.01" />
              </div>
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea placeholder="Descreva os benefícios do plano" />
            </div>

            <div>
              <Label>Quantidade de Serviços Inclusos</Label>
              <Input type="number" placeholder="0" />
            </div>

            <div>
              <Label>Benefícios (um por linha)</Label>
              <Textarea placeholder="Benefício 1&#10;Benefício 2&#10;Benefício 3" rows={5} />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Plano
              </Button>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
