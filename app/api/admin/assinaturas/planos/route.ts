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

    const { data: planos, error } = await supabase
      .from("planos_assinatura")
      .select("*")
      .eq("barbershop_id", profile.barbershop_id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Erro ao buscar planos:", error)
      return NextResponse.json({ error: "Erro ao buscar planos" }, { status: 500 })
    }

    return NextResponse.json({ planos }, { status: 200 })
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
    const { nome, descricao, preco, frequencia } = body

    const { data: profile } = await supabase
      .from("profiles")
      .select("barbershop_id")
      .eq("id", user.id)
      .single()

    if (!profile?.barbershop_id) {
      return NextResponse.json({ error: "Barbearia não encontrada" }, { status: 400 })
    }

    const { data: plano, error } = await supabase
      .from("planos_assinatura")
      .insert({
        barbershop_id: profile.barbershop_id,
        nome,
        descricao: descricao || null,
        preco: parseFloat(preco),
        frequencia: frequencia || "mensal",
        ativo: true,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Erro ao criar plano:", error)
      return NextResponse.json({ error: "Erro ao criar plano de assinatura" }, { status: 500 })
    }

    return NextResponse.json({ plano }, { status: 201 })
  } catch (error) {
    console.error("[v0] Erro na API POST:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
