import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { barbershop_id, service_id, barber_id, client_name, client_phone, start_time, end_time } = body

    if (!barbershop_id || !service_id || !start_time || !client_name || !client_phone) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

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
    }

    // Criar agendamento
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .insert({
        barbershop_id,
        client_id,
        service_id,
        barber_id: barber_id || null,
        start_time,
        end_time,
        status: "confirmed",
      })
      .select()
      .single()

    if (appointmentError) {
      console.error("[v0] Erro ao criar agendamento:", appointmentError)
      return NextResponse.json({ error: "Erro ao criar agendamento" }, { status: 500 })
    }

    console.log("[v0] Agendamento criado com sucesso:", appointment.id)
    return NextResponse.json({ appointment }, { status: 201 })
  } catch (error) {
    console.error("[v0] Erro na API de booking:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
