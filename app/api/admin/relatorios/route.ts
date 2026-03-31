import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("barbershop_id")
      .eq("id", user.id)
      .single()

    if (!profile?.barbershop_id) {
      return NextResponse.json({ error: "Barbearia não encontrada" }, { status: 400 })
    }

    // Buscar dados de bebidas vendidas
    const { data: bebidas } = await supabase
      .from("itens_comanda")
      .select("*")
      .eq("tipo", "bebida")
      .in("comanda_id", 
        (await supabase
          .from("comandas")
          .select("id")
          .eq("barbershop_id", profile.barbershop_id)
          .eq("status", "paga")
        ).data?.map(c => c.id) || []
      )

    // Agrupar bebidas por nome
    const bebidhasAgrupadas = bebidas?.reduce((acc: any, item: any) => {
      const existing = acc.find((b: any) => b.nome === item.nome)
      if (existing) {
        existing.quantidade += item.quantidade || 1
        existing.total += item.valor_total || 0
        existing.preco_unitario = existing.total / existing.quantidade
      } else {
        acc.push({
          nome: item.nome,
          quantidade: item.quantidade || 1,
          preco_unitario: item.valor_unitario || 0,
          total: item.valor_total || 0,
        })
      }
      return acc
    }, []) || []

    // Buscar dados de produtos vendidos
    const { data: produtos } = await supabase
      .from("itens_comanda")
      .select("*")
      .eq("tipo", "produto")
      .in("comanda_id",
        (await supabase
          .from("comandas")
          .select("id")
          .eq("barbershop_id", profile.barbershop_id)
          .eq("status", "paga")
        ).data?.map(c => c.id) || []
      )

    // Agrupar produtos por nome
    const produtosAgrupados = produtos?.reduce((acc: any, item: any) => {
      const existing = acc.find((p: any) => p.nome === item.nome)
      if (existing) {
        existing.quantidade += item.quantidade || 1
        existing.total += item.valor_total || 0
        existing.preco_unitario = existing.total / existing.quantidade
      } else {
        acc.push({
          nome: item.nome,
          quantidade: item.quantidade || 1,
          preco_unitario: item.valor_unitario || 0,
          total: item.valor_total || 0,
        })
      }
      return acc
    }, []) || []

    // Buscar dados de serviços realizados
    const { data: servicos } = await supabase
      .from("appointments")
      .select("service_id, services(name, price)")
      .eq("barbershop_id", profile.barbershop_id)
      .eq("status", "completed")

    // Agrupar serviços por nome
    const servicosAgrupados = servicos?.reduce((acc: any, item: any) => {
      const serviceName = item.services?.name || "Serviço"
      const servicePrice = (item.services?.price || 0) / 100
      const existing = acc.find((s: any) => s.nome === serviceName)
      if (existing) {
        existing.quantidade += 1
        existing.total += servicePrice
        existing.preco_unitario = servicePrice
      } else {
        acc.push({
          nome: serviceName,
          quantidade: 1,
          preco_unitario: servicePrice,
          total: servicePrice,
        })
      }
      return acc
    }, []) || []

    // Buscar dados de gastos
    const { data: gastos } = await supabase
      .from("despesas")
      .select("*")
      .eq("barbershop_id", profile.barbershop_id)
      .gte("data", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    return NextResponse.json({
      barbershopId: profile.barbershop_id,
      bebidas: bebidhasAgrupadas,
      produtos: produtosAgrupados,
      servicos: servicosAgrupados,
      gastos: gastos || [],
    }, { status: 200 })
  } catch (error) {
    console.error("[v0] Erro na API de relatórios:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Erro interno do servidor" 
    }, { status: 500 })
  }
}
