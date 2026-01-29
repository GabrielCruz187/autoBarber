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

    const { data: produtos, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("barbershop_id", profile.barbershop_id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Erro ao buscar produtos:", error)
      return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 })
    }

    return NextResponse.json({ produtos }, { status: 200 })
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
    const { nome, categoria, preco, quantidade, quantidade_minima } = body

    const { data: profile } = await supabase
      .from("profiles")
      .select("barbershop_id")
      .eq("id", user.id)
      .single()

    if (!profile?.barbershop_id) {
      return NextResponse.json({ error: "Barbearia não encontrada" }, { status: 400 })
    }

    const { data: produto, error } = await supabase
      .from("produtos")
      .insert({
        barbershop_id: profile.barbershop_id,
        nome,
        categoria: categoria || "geral",
        preco: parseFloat(preco),
        quantidade: parseInt(quantidade),
        quantidade_minima: parseInt(quantidade_minima) || 10,
        ativo: true,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Erro ao adicionar produto:", error)
      return NextResponse.json({ error: "Erro ao adicionar produto" }, { status: 500 })
    }

    return NextResponse.json({ produto }, { status: 201 })
  } catch (error) {
    console.error("[v0] Erro na API POST:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

