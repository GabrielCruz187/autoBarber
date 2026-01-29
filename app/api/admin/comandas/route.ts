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
    const { cliente_id, observacoes } = body

    const { data: profile } = await supabase
      .from("profiles")
      .select("barbershop_id")
      .eq("id", user.id)
      .single()

    if (!profile?.barbershop_id) {
      return NextResponse.json({ error: "Barbearia não encontrada" }, { status: 400 })
    }

    const { data: comanda, error } = await supabase
      .from("comandas")
      .insert({
        barbershop_id: profile.barbershop_id,
        cliente_id: cliente_id || null,
        observacoes: observacoes || null,
        status: "aberta",
        total: 0,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Erro ao criar comanda:", error)
      return NextResponse.json({ error: "Erro ao criar comanda" }, { status: 500 })
    }

    return NextResponse.json({ comanda }, { status: 201 })
  } catch (error) {
    console.error("[v0] Erro na API POST:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
