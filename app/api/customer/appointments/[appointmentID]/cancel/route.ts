import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    // Decode token to get customer ID and barbershop ID
    const tokenData = Buffer.from(token, 'base64').toString('utf-8')
    const [customerId, barbershopId] = tokenData.split(':')

    const supabase = await createClient()

    // Verify appointment belongs to customer
    const { data: appointment } = await supabase
      .from('appointments')
      .select('id, customer_id, start_time')
      .eq('id', appointmentId)
      .eq('customer_id', customerId)
      .eq('barbershop_id', barbershopId)
      .single()

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Check if can cancel (at least 24 hours before)
    const appointmentTime = new Date(appointment.start_time).getTime()
    const now = Date.now()
    const canCancel = appointmentTime - now > 24 * 60 * 60 * 1000

    if (!canCancel) {
      return NextResponse.json(
        { error: 'Cannot cancel within 24 hours of appointment' },
        { status: 400 }
      )
    }

    // Cancel appointment
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Cancel error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
