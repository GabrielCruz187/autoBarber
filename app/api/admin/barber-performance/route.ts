import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { subDays, startOfDay, endOfDay } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = request.nextUrl
    const range = searchParams.get('range') || 'month'

    // Get barbershop from user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('barbershop_id')
      .eq('id', user.id)
      .single()

    if (!profile?.barbershop_id) {
      return NextResponse.json({ error: 'No barbershop found' }, { status: 404 })
    }

    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    if (range === 'week') {
      startDate = subDays(now, 7)
    } else if (range === 'year') {
      startDate = subDays(now, 365)
    } else {
      startDate = subDays(now, 30)
    }

    // Get all barbers
    const { data: barbers } = await supabase
      .from('barbers')
      .select('id, first_name, last_name')
      .eq('barbershop_id', profile.barbershop_id)

    if (!barbers) {
      return NextResponse.json([])
    }

    // Get appointments and calculate metrics
    const { data: appointments } = await supabase
      .from('appointments')
      .select('barber_id, total_price, status, start_time')
      .eq('barbershop_id', profile.barbershop_id)
      .eq('status', 'completed')
      .gte('start_time', startDate.toISOString())

    // Calculate performance for each barber
    const performances = barbers.map((barber) => {
      const barberAppointments = (appointments || []).filter(
        (apt) => apt.barber_id === barber.id
      )

      const totalRevenue = barberAppointments.reduce(
        (sum, apt) => sum + (apt.total_price || 0),
        0
      )

      // Commission: 50% of revenue
      const commission = totalRevenue * 0.5

      return {
        barber_id: barber.id,
        barber_name: `${barber.first_name} ${barber.last_name}`,
        total_appointments: barberAppointments.length,
        total_revenue: totalRevenue,
        commission: commission,
        average_rating: 4.8, // TODO: Get from reviews
      }
    })

    // Sort by revenue (descending)
    performances.sort((a, b) => b.total_revenue - a.total_revenue)

    return NextResponse.json(performances)
  } catch (error) {
    console.error('[v0] Erro em barber-performance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
