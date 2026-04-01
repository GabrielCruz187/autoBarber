import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[v0] GET /api/client/dashboard - iniciando')
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let tokenData: any
    
    try {
      tokenData = JSON.parse(Buffer.from(token, 'base64').toString())
    } catch {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const { clientId, barbershopId } = tokenData

    const supabase = await createClient()

    // Buscar dados do cliente
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      console.log('[v0] Cliente não encontrado:', clientId)
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Buscar agendamentos do cliente
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        end_time,
        status,
        service_id,
        barber_id,
        services!inner(name),
        barbers!inner(first_name, last_name)
      `)
      .eq('client_id', clientId)
      .order('start_time', { ascending: false })

    if (appointmentsError) {
      console.log('[v0] Erro ao buscar agendamentos:', appointmentsError)
    }

    // Buscar planos de assinatura visíveis da barbearia
    const { data: plans } = await supabase
      .from('planos_assinatura')
      .select('*')
      .eq('barbershop_id', client.barbershop_id)
      .eq('ativo', true)
      .eq('visivel', true)
      .order('preco')

    console.log('[v0] Dashboard carregado com sucesso para cliente:', clientId)

    return NextResponse.json({
      success: true,
      client,
      appointments: (appointments || []).map(apt => ({
        id: apt.id,
        start_time: apt.start_time,
        end_time: apt.end_time,
        status: apt.status,
        service_name: apt.services?.name || 'Serviço',
        barber_name: apt.barbers ? `${apt.barbers.first_name} ${apt.barbers.last_name}` : 'Barbeiro'
      })),
      plans: plans || []
    }, { status: 200 })
  } catch (error) {
    console.error('[v0] Erro na rota de dashboard:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar dashboard' },
      { status: 500 }
    )
  }
}
