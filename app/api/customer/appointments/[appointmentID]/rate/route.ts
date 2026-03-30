import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params
    const body = await request.json()
    const { token, rating } = body

    if (!token || !rating) {
      return NextResponse.json({ error: 'Token and rating required' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Decode token to get customer ID and barbershop ID
    const tokenData = Buffer.from(token, 'base64').toString('utf-8')
    const [customerId, barbershopId] = tokenData.split(':')

    const supabase = await createClient()

    // Verify appointment belongs to customer
    const { data: appointment } = await supabase
      .from('appointments')
      .select('id, customer_id, status')
      .eq('id', appointmentId)
      .eq('customer_id', customerId)
      .eq('barbershop_id', barbershopId)
      .single()

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    if (appointment.status !== 'completed') {
      return NextResponse.json({ error: 'Can only rate completed appointments' }, { status: 400 })
    }

    // Update rating
    const { error } = await supabase
      .from('appointments')
      .update({ rating })
      .eq('id', appointmentId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Rating error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
