import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] POST /api/signup called')
    const body = await request.json()
    const { barbershop_id, first_name, phone } = body

    console.log('[v0] Data received:', { barbershop_id, first_name, phone })

    const supabase = await createClient()

    // Criar cliente
    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        barbershop_id,
        first_name,
        last_name: '',
        phone,
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Error creating client:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[v0] Client created:', client.id)
    return NextResponse.json({ client }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error in POST /api/signup:', error)
    return NextResponse.json(
      { error: 'Erro ao cadastrar cliente' },
      { status: 500 }
    )
  }
}
