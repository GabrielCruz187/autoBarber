// app/api/availability/route.ts
// Retorna os slots ocupados para um barbeiro em uma data específica
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addMinutes, format, parseISO } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const barbershop_id = searchParams.get('barbershop_id')
    const barber_id = searchParams.get('barber_id')
    const date = searchParams.get('date') // yyyy-MM-dd
    const duration = parseInt(searchParams.get('duration') || '30', 10)

    if (!barbershop_id || !date) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
    }

    const supabase = await createClient()

    // Busca agendamentos do dia
    let query = supabase
      .from('appointments')
      .select('start_time, end_time, status')
      .eq('barbershop_id', barbershop_id)
      .not('status', 'in', '("cancelled","no_show")')
      .gte('start_time', `${date}T00:00:00`)
      .lte('start_time', `${date}T23:59:59`)

    if (barber_id) {
      query = query.eq('barber_id', barber_id)
    }

    const { data: appointments, error } = await query

    if (error) {
      console.error('[v0] Erro ao buscar disponibilidade:', error)
      return NextResponse.json({ busy_slots: [] })
    }

    // Gera todos os slots do dia (8h às 20h, de 30 em 30 min)
    const allSlots: string[] = []
    for (let h = 8; h < 20; h++) {
      for (let m = 0; m < 60; m += 30) {
        allSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
      }
    }

    // Marca como ocupado qualquer slot que sobreponha com agendamentos existentes
    const busySlots = allSlots.filter((slot) => {
      const slotStart = new Date(`${date}T${slot}:00`)
      const slotEnd = addMinutes(slotStart, duration)

      return appointments?.some((apt) => {
        const aptStart = new Date(apt.start_time)
        const aptEnd = new Date(apt.end_time)
        // Sobreposição: slot começa antes do agendamento terminar E termina depois do agendamento começar
        return slotStart < aptEnd && slotEnd > aptStart
      })
    })

    return NextResponse.json({ busy_slots: busySlots })
  } catch (error) {
    console.error('[v0] Erro na API de disponibilidade:', error)
    return NextResponse.json({ busy_slots: [] })
  }
}