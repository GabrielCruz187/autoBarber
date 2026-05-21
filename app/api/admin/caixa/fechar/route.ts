// app/api/admin/caixa/fechar/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
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

    // Busca o caixa aberto com os dados atuais
    const { data: caixaAberto, error: caixaError } = await supabase
      .from("caixas")
      .select("id, saldo_inicial, total_entradas, total_saidas")
      .eq("barbershop_id", profile.barbershop_id)
      .eq("status", "aberto")
      .single()

    if (caixaError || !caixaAberto) {
      return NextResponse.json({ error: "Nenhum caixa aberto encontrado" }, { status: 400 })
    }

    // Recalcula entradas somando movimentações do período para garantir consistência
    const { data: movimentacoes } = await supabase
      .from("movimentacoes_financeiras")
      .select("tipo, valor")
      .eq("barbershop_id", profile.barbershop_id)
      .eq("caixa_id", caixaAberto.id)

    let totalEntradas = Number(caixaAberto.total_entradas) || 0
    let totalSaidas = Number(caixaAberto.total_saidas) || 0

    // Se houver movimentações vinculadas ao caixa, recalcula do zero para garantir precisão
    if (movimentacoes && movimentacoes.length > 0) {
      totalEntradas = movimentacoes
        .filter((m) => m.tipo === "entrada")
        .reduce((acc, m) => acc + Number(m.valor), 0)
      totalSaidas = movimentacoes
        .filter((m) => m.tipo === "saida")
        .reduce((acc, m) => acc + Number(m.valor), 0)
    }

    // Saldo final = saldo inicial + entradas - saídas
    const saldoFinal =
      Number(caixaAberto.saldo_inicial) + totalEntradas - totalSaidas

    const body = await request.json().catch(() => ({}))
    const observacoes = body.observacoes || null

    // Fecha o caixa com saldo calculado
    const { data: caixaFechado, error: updateError } = await supabase
      .from("caixas")
      .update({
        status: "fechado",
        data_fechamento: new Date().toISOString(),
        total_entradas: totalEntradas,
        total_saidas: totalSaidas,
        saldo_final: saldoFinal,
        observacoes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", caixaAberto.id)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] Erro ao fechar caixa:", updateError)
      return NextResponse.json({ error: "Erro ao fechar caixa" }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        caixa: caixaFechado,
        resumo: {
          saldo_inicial: Number(caixaAberto.saldo_inicial),
          total_entradas: totalEntradas,
          total_saidas: totalSaidas,
          saldo_final: saldoFinal,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[v0] Erro na API de fechamento:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno do servidor" },
      { status: 500 }
    )
  }
}