import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  console.log("[v0] GET /api/public/clients - Route exists and is accessible")
  return NextResponse.json({ message: "API de clientes públicos ativa" }, { status: 200 })
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] POST /api/public/clients - Iniciando cadastro de cliente")
    const supabase = await createClient()
    const body = await request.json()
    const { barbershop_id, first_name, phone } = body

    console.log("[v0] Dados recebidos:", { barbershop_id, first_name, phone })

    if (!barbershop_id || !first_name || !phone) {
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 }
      )
    }

    // Verificar se a barbearia existe
    const { data: barbershop, error: barbershopError } = await supabase
      .from("barbershops")
      .select("id")
      .eq("id", barbershop_id)
      .eq("is_active", true)
      .single()

    if (barbershopError || !barbershop) {
      console.log("[v0] Barbearia não encontrada:", barbershopError)
      return NextResponse.json(
        { error: "Barbearia não encontrada" },
        { status: 404 }
      )
    }

    // Verificar se o cliente já existe
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("barbershop_id", barbershop_id)
      .eq("phone", phone)
      .single()

    if (existingClient) {
      console.log("[v0] Cliente já existe:", existingClient.id)
      return NextResponse.json(
        { client: existingClient },
        { status: 200 }
      )
    }

    // Criar novo cliente
    const { data: client, error } = await supabase
      .from("clients")
      .insert({
        barbershop_id,
        first_name,
        phone,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Erro ao criar cliente:", error)
      return NextResponse.json(
        { error: "Erro ao cadastrar cliente" },
        { status: 500 }
      )
    }

    console.log("[v0] Cliente criado com sucesso:", client.id)
    return NextResponse.json({ client }, { status: 201 })
  } catch (error) {
    console.error("[v0] Erro na API de clientes:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
