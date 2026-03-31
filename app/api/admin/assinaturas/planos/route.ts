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
    console.log("[v0] POST /api/admin/assinaturas/planos - Iniciando")
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.warn("[v0] Usuário não autenticado")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    console.log("[v0] Body recebido:", body)
    
    const { nome, descricao, preco, servicos_inclusos, beneficios, visivel } = body

    if (!nome || preco === undefined) {
      console.warn("[v0] Campos obrigatórios faltando:", { nome, preco })
      return NextResponse.json({ error: "Nome e preço são obrigatórios" }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("barbershop_id")
      .eq("id", user.id)
      .single()

    if (!profile?.barbershop_id) {
      console.warn("[v0] Barbearia não encontrada para usuário:", user.id)
      return NextResponse.json({ error: "Barbearia não encontrada" }, { status: 400 })
    }

    console.log("[v0] Criando plano para barbearia:", profile.barbershop_id)

    // Try simple insert first with only essential fields
    const { data: plano, error } = await supabase
      .from("planos_assinatura")
      .insert({
        barbershop_id: profile.barbershop_id,
        nome: nome.trim(),
        preco: parseFloat(preco),
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Erro ao criar plano:", error)
      return NextResponse.json({ error: `Erro ao criar plano: ${error.message}` }, { status: 500 })
    }

    // Update with optional fields if provided
    if (descricao || servicos_inclusos || (Array.isArray(beneficios) && beneficios.length > 0) || visivel !== undefined) {
      const updateData: any = {}
      if (descricao) updateData.descricao = descricao.trim()
      if (servicos_inclusos) updateData.servicos_inclusos = parseInt(servicos_inclusos)
      if (Array.isArray(beneficios) && beneficios.length > 0) {
        updateData.beneficios = beneficios.filter((b: string) => b.trim())
      }
      if (visivel !== undefined) updateData.visivel = visivel

      console.log("[v0] Atualizando plano com campos opcionais:", updateData)
      
      const { error: updateError } = await supabase
        .from("planos_assinatura")
        .update(updateData)
        .eq("id", plano.id)

      if (updateError) {
        console.warn("[v0] Aviso ao atualizar campos opcionais:", updateError)
      }
    }

    if (error) {
      console.error("[v0] Erro ao criar plano:", error)
      return NextResponse.json({ error: `Erro ao criar plano: ${error.message}` }, { status: 500 })
    }

    console.log("[v0] Plano criado com sucesso:", plano.id)
    return NextResponse.json({ plano, success: true }, { status: 201 })
  } catch (error) {
    console.error("[v0] Erro na API POST:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Erro interno do servidor" 
    }, { status: 500 })
  }
}

