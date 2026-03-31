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

    const body = await request.json()
    const { saldo_inicial } = body

    if (saldo_inicial === undefined) {
      return NextResponse.json({ error: "Saldo inicial é obrigatório" }, { status: 400 })
    }

    // Verificar se já existe caixa aberto
    const { data: caixaAberto } = await supabase
      .from("caixas")
      .select("id")
      .eq("barbershop_id", profile.barbershop_id)
      .eq("status", "aberto")
      .single()

    if (caixaAberto) {
      return NextResponse.json({ error: "Já existe caixa aberto" }, { status: 400 })
    }

    // Criar novo caixa
    const { data: caixa, error } = await supabase
      .from("caixas")
      .insert({
        barbershop_id: profile.barbershop_id,
        saldo_inicial: parseFloat(saldo_inicial),
        total_entradas: 0,
        total_saidas: 0,
        status: "aberto",
        data_abertura: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Erro ao criar caixa:", error)
      return NextResponse.json({ error: "Erro ao abrir caixa" }, { status: 500 })
    }

    return NextResponse.json({ caixa, success: true }, { status: 201 })
  } catch (error) {
    console.error("[v0] Erro na API:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Erro interno do servidor" 
    }, { status: 500 })
  }
}
