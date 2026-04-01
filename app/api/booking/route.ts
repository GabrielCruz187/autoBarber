import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    // Verificar se Supabase está configurado
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("[v0] Supabase não configurado")
      return NextResponse.json(
        { error: "Servidor não configurado. Por favor, adicione as variáveis de ambiente do Supabase." },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    const body = await request.json()
    const { barbershop_id, service_id, barber_id, subscription_plan_id, client_name, client_phone, start_time, end_time } = body

    console.log("[v0] Dados recebidos:", { barbershop_id, service_id, barber_id, client_name, client_phone })

    if (!barbershop_id || !service_id || !start_time || !client_name || !client_phone) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Buscar serviço para obter duração e preço
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("duration_minutes, price")
      .eq("id", service_id)
      .eq("barbershop_id", barbershop_id)
      .single()

    if (serviceError || !service) {
      console.error("[v0] Erro ao buscar serviço:", serviceError)
      return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 })
    }

    console.log("[v0] Serviço encontrado:", service)

    // Verificar se existe cliente, se não, criar
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("barbershop_id", barbershop_id)
      .eq("phone", client_phone)
      .single()

    let client_id = existingClient?.id

    if (!client_id) {
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert({
          barbershop_id,
          first_name: client_name,
          last_name: "",
          phone: client_phone,
        })
        .select()
        .single()

      if (clientError || !newClient) {
        console.error("[v0] Erro ao criar cliente:", clientError)
        return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 })
      }
      client_id = newClient.id
      console.log("[v0] Cliente criado:", client_id)
    }

    // Se barber_id não foi fornecido, tentar obter o primeiro barbeiro disponível
    let barber_id_to_use = barber_id
    if (!barber_id_to_use) {
      const { data: barbers, error: barbersError } = await supabase
        .from("barbers")
        .select("id")
        .eq("barbershop_id", barbershop_id)
        .eq("is_active", true)
        .limit(1)

      if (barbersError || !barbers || barbers.length === 0) {
        console.error("[v0] Nenhum barbeiro disponível")
        return NextResponse.json({ error: "Nenhum barbeiro disponível" }, { status: 400 })
      }
      barber_id_to_use = barbers[0].id
      console.log("[v0] Barbeiro selecionado:", barber_id_to_use)
    }

    // Calcular preço total (convertendo de centavos se necessário)
    const total_price = typeof service.price === 'number' ? service.price / 100 : service.price

    // Criar agendamento
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .insert({
        barbershop_id,
        client_id,
        service_id,
        barber_id: barber_id_to_use,
        subscription_plan_id,
        start_time,
        end_time,
        duration_minutes: service.duration_minutes,
        total_price: total_price,
        status: "confirmed",
      })
      .select()
      .single()

    if (appointmentError) {
      console.error("[v0] Erro ao criar agendamento:", appointmentError)
      return NextResponse.json({ error: `Erro ao criar agendamento: ${appointmentError.message}` }, { status: 500 })
    }

    console.log("[v0] Agendamento criado com sucesso:", appointment.id)
    return NextResponse.json({ appointment }, { status: 201 })
  } catch (error) {
    console.error("[v0] Erro na API de booking:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}


