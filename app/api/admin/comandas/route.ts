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

    const { data: comandas, error } = await supabase
      .from("comandas")
      .select("*")
      .eq("barbershop_id", profile.barbershop_id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Erro ao buscar comandas:", error)
      return NextResponse.json({ error: "Erro ao buscar comandas" }, { status: 500 })
    }

    return NextResponse.json({ comandas }, { status: 200 })
  } catch (error) {
    console.error("[v0] Erro na API GET:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { cliente_id, observacoes, total } = body

    console.log("[v0] POST /api/admin/comandas - Recebido:", { cliente_id, observacoes, total })

    // Validação do valor total
    if (total === undefined || total === null || parseFloat(total) <= 0) {
      console.error("[v0] Erro: valor total inválido:", total)
      return NextResponse.json({ 
        error: "Valor total deve ser maior que zero" 
      }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("barbershop_id")
      .eq("id", user.id)
      .single()

    if (!profile?.barbershop_id) {
      console.error("[v0] Erro: barbearia não encontrada para usuário:", user.id)
      return NextResponse.json({ error: "Barbearia não encontrada" }, { status: 400 })
    }

    const totalAmount = parseFloat(total)

    const { data: comanda, error } = await supabase
      .from("comandas")
      .insert({
        barbershop_id: profile.barbershop_id,
        cliente_id: cliente_id || null,
        observacoes: observacoes || null,
        status: "aberta",
        total: totalAmount,
        data_abertura: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Erro ao inserir comanda no banco:", error)
      return NextResponse.json({ 
        error: "Erro ao criar comanda",
        details: error.message
      }, { status: 500 })
    }

    console.log("[v0] Comanda criada com sucesso:", { id: comanda.id, total: comanda.total })

    return NextResponse.json({ comanda }, { status: 201 })
  } catch (error) {
    console.error("[v0] Erro na API POST /api/admin/comandas:", error)
    return NextResponse.json({ 
      error: "Erro interno do servidor",
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}



