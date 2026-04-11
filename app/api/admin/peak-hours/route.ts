import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = request.nextUrl
    const barbershopId = searchParams.get('barbershopId')
    const period = searchParams.get('period') || '7'

    if (!barbershopId) {
      return NextResponse.json({ error: 'barbershopId required' }, { status: 400 })
    }

    const days = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    // Fetch appointments
    const { data: appointments } = await supabase
      .from('appointments')
      .select('id, start_time, end_time, barber_id')
      .eq('barbershop_id', barbershopId)
      .gte('start_time', startDate.toISOString())
      .eq('status', 'confirmed')

    // Count barbers for capacity calculation
    const { count: barberCount } = await supabase
      .from('barbers')
      .select('*', { count: 'exact', head: true })
      .eq('barbershop_id', barbershopId)
      .eq('is_active', true)

    const capacity = barberCount || 1

    // Build heatmap data
    const heatmapData: Record<string, Record<number, { count: number; capacity: number }>> = {}

    appointments?.forEach(apt => {
      const date = new Date(apt.start_time)
      const dayOfWeek = (date.getDay() + 6) % 7 // 0 = Monday
      const hour = date.getHours()

      const key = `${dayOfWeek}-${hour}`
      if (!heatmapData[key]) {
        heatmapData[key] = { count: 0, capacity: capacity * days }
      }
      heatmapData[key].count += 1
    })

    // Format response
    const result = Object.entries(heatmapData).map(([key, value]) => {
      const [dayOfWeek, hour] = key.split('-').map(Number)
      const occupancyPercentage = Math.round((value.count / value.capacity) * 100)

      return {
        dayOfWeek,
        hour,
        occupancyPercentage: Math.min(occupancyPercentage, 100),
        appointmentCount: value.count,
        capacity: value.capacity,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[v0] Error fetching peak hours:', error)
    return NextResponse.json(
      { error: 'Failed to fetch peak hours data' },
      { status: 500 }
    )
  }
}
