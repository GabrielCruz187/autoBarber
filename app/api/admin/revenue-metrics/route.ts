import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = request.nextUrl
    const barbershopId = searchParams.get('barbershopId')
    const period = searchParams.get('period') || '30'

    if (!barbershopId) {
      return NextResponse.json({ error: 'barbershopId required' }, { status: 400 })
    }

    const days = parseInt(period)
    const startDate = subDays(new Date(), days)

    // Fetch appointments
    const { data: appointments } = await supabase
      .from('appointments')
      .select('id, start_time, total_price, service_id, services(name)')
      .eq('barbershop_id', barbershopId)
      .eq('status', 'completed')
      .gte('start_time', startDate.toISOString())

    // Daily Revenue
    const dailyRevenueMap: Record<string, number> = {}
    appointments?.forEach(apt => {
      const date = format(new Date(apt.start_time), 'dd/MM')
      dailyRevenueMap[date] = (dailyRevenueMap[date] || 0) + (apt.total_price || 0)
    })

    const dailyRevenue = Object.entries(dailyRevenueMap)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => {
        const [dayA, monthA] = a.date.split('/')
        const [dayB, monthB] = b.date.split('/')
        return parseInt(monthA) - parseInt(monthB) || parseInt(dayA) - parseInt(dayB)
      })

    // Monthly Revenue
    const monthlyRevenueMap: Record<string, number> = {}
    appointments?.forEach(apt => {
      const date = format(new Date(apt.start_time), 'MMM/yy', { locale: ptBR })
      monthlyRevenueMap[date] = (monthlyRevenueMap[date] || 0) + (apt.total_price || 0)
    })

    const monthlyRevenue = Object.entries(monthlyRevenueMap).map(([month, revenue]) => ({
      month,
      revenue,
    }))

    // Top Services
    const serviceMap: Record<string, { count: number; revenue: number; name: string }> = {}
    appointments?.forEach(apt => {
      const serviceName = (apt.services as any)?.name || 'Serviço'
      if (!serviceMap[serviceName]) {
        serviceMap[serviceName] = { count: 0, revenue: 0, name: serviceName }
      }
      serviceMap[serviceName].count += 1
      serviceMap[serviceName].revenue += apt.total_price || 0
    })

    const topServices = Object.values(serviceMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    return NextResponse.json({
      dailyRevenue,
      monthlyRevenue,
      topServices,
    })
  } catch (error) {
    console.error('[v0] Error fetching revenue metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revenue metrics' },
      { status: 500 }
    )
  }
}
