import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface PlansPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function PlansPage({ params }: PlansPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Buscar barbearia
  const { data: barbershop } = await supabase
    .from("barbershops")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (!barbershop) {
    notFound()
  }

  // Buscar planos visíveis
  const { data: plans } = await supabase
    .from("planos_assinatura")
    .select("*")
    .eq("barbershop_id", barbershop.id)
    .eq("ativo", true)
    .eq("visivel", true)
    .order("preco")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Planos de Assinatura</h1>
          <p className="text-muted-foreground text-lg">Escolha o melhor plano para você em {barbershop.name}</p>
        </div>

        {plans && plans.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map(plan => (
              <Card key={plan.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.nome}</CardTitle>
                  {plan.descricao && (
                    <p className="text-sm text-muted-foreground mt-2">{plan.descricao}</p>
                  )}
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  <div>
                    <p className="text-4xl font-bold">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(plan.preco)}
                    </p>
                    <p className="text-muted-foreground">por mês</p>
                  </div>

                  {plan.beneficios && Array.isArray(plan.beneficios) && plan.beneficios.length > 0 && (
                    <div>
                      <p className="font-semibold mb-3">Benefícios</p>
                      <ul className="space-y-2">
                        {plan.beneficios.map((benefit: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                            <span className="text-sm">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {plan.servicos_inclusos && (
                    <div className="pt-3 border-t">
                      <p className="text-sm">
                        <span className="font-semibold text-lg">{plan.servicos_inclusos}</span>
                        <span className="text-muted-foreground"> serviços inclusos por mês</span>
                      </p>
                    </div>
                  )}

                  <Button className="w-full mt-auto">Contratar Plano</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-lg text-muted-foreground">Nenhum plano de assinatura disponível no momento</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
