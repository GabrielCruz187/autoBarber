import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { subDays, format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = request.nextUrl
    const barbershopId = searchParams.get('barbershopId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!barbershopId) {
      return NextResponse.json({ error: 'barbershopId required' }, { status: 400 })
    }

    const start = startDate ? new Date(startDate) : subDays(new Date(), 30)
    const end = endDate ? new Date(endDate) : new Date()

    // Fetch all completed appointments with barber and service info
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        total_price,
        status,
        barber:barbers(id, first_name, last_name),
        service:services(id, name, commission_percentage)
      `)
      .eq('barbershop_id', barbershopId)
      .eq('status', 'completed')
      .gte('start_time', start.toISOString())
      .lte('start_time', end.toISOString())

    if (error) throw error

    // Group by barber and calculate commissions
    const commissionsByBarber: Record<string, any> = {}

    appointments?.forEach((apt: any) => {
      const barber = apt.barber
      const service = apt.service

      if (!barber) return

      const barberId = barber.id
      const commissionPercentage = service?.commission_percentage || 50

      if (!commissionsByBarber[barberId]) {
        commissionsByBarber[barberId] = {
          barberId,
          barberName: `${barber.first_name} ${barber.last_name}`,
          services: 0,
          subscription: 0,
          products: 0,
          bonus: 0,
          vouchers: 0,
          totalCommission: 0,
          appointments: [],
        }
      }

      const commission = (apt.total_price * commissionPercentage) / 100

      commissionsByBarber[barberId].services += commission
      commissionsByBarber[barberId].totalCommission += commission
      commissionsByBarber[barberId].appointments.push({
        id: apt.id,
        date: format(new Date(apt.start_time), 'dd/MM/yyyy'),
        service: service?.name || 'Serviço',
        value: apt.total_price,
        commission: commission,
      })
    })

    const barbers = Object.values(commissionsByBarber).sort(
      (a: any, b: any) => b.totalCommission - a.totalCommission
    )

    const totalCommission = barbers.reduce((sum: number, b: any) => sum + b.totalCommission, 0)
    const totalPending = barbers.reduce((sum: number, b: any) => sum + b.totalCommission, 0)

    return NextResponse.json({
      barbers,
      totalCommission,
      totalPending,
      startDate: format(start, 'dd/MM/yyyy'),
      endDate: format(end, 'dd/MM/yyyy'),
    })
  } catch (error) {
    console.error('[v0] Erro ao buscar comissões:', error)
    return NextResponse.json(
      {
        barbers: [],
        totalCommission: 0,
        totalPending: 0,
        error: 'Supabase não configurado',
      },
      { status: 200 }
    )
  }
}
