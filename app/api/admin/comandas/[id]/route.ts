import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: "Status é obrigatório" }, { status: 400 })
    }

    // Verificar se comanda pertence à barbearia do usuário
    const { data: comanda } = await supabase
      .from("comandas")
      .select("id")
      .eq("id", id)
      .eq("barbershop_id", profile.barbershop_id)
      .single()

    if (!comanda) {
      return NextResponse.json({ error: "Comanda não encontrada" }, { status: 404 })
    }

    // Atualizar status
    const { data: updated, error } = await supabase
      .from("comandas")
      .update({ status })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Erro ao atualizar comanda:", error)
      return NextResponse.json({ error: "Erro ao atualizar comanda" }, { status: 500 })
    }

    return NextResponse.json({ comanda: updated, success: true }, { status: 200 })
  } catch (error) {
    console.error("[v0] Erro na API:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Erro interno do servidor" 
    }, { status: 500 })
  }
}
