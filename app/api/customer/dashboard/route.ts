import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    // Decode token to get customer ID and barbershop ID
    const tokenData = Buffer.from(token, 'base64').toString('utf-8')
    const [customerId, barbershopId] = tokenData.split(':')

    if (!customerId || !barbershopId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get customer data
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, first_name, last_name, email, phone_number')
      .eq('id', customerId)
      .eq('barbershop_id', barbershopId)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Get appointments
    const { data: appointments } = await supabase
      .from('appointments')
      .select(
        `
        id,
        start_time,
        end_time,
        status,
        service:services(id, name, duration_minutes, price),
        barber:barbers(first_name, last_name)
      `
      )
      .eq('customer_id', customerId)
      .eq('barbershop_id', barbershopId)
      .order('start_time', { ascending: false })

    // Get subscription plans
    const { data: subscriptionPlans } = await supabase
      .from('planos_assinatura')
      .select('*')
      .eq('barbershop_id', barbershopId)
      .eq('ativo', true)
      .order('preco')

    return NextResponse.json({
      customer,
      appointments: appointments || [],
      subscriptionPlans: subscriptionPlans || [],
    })
  } catch (error) {
    console.error('[v0] Dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
