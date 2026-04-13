import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = request.nextUrl
    const barbershopId = searchParams.get('barbershopId')
    const status = searchParams.get('status')

    if (!barbershopId) {
      return NextResponse.json({ error: 'barbershopId required' }, { status: 400 })
    }

    let query = supabase
      .from('expenses')
      .select('*')
      .eq('barbershop_id', barbershopId)
      .order('due_date', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: expenses, error } = await query

    if (error) throw error

    const totalPending = expenses?.reduce(
      (sum: number, e: any) => (e.status === 'pending' ? sum + e.amount : sum),
      0
    ) || 0

    const totalPaid = expenses?.reduce(
      (sum: number, e: any) => (e.status === 'paid' ? sum + e.amount : sum),
      0
    ) || 0

    const total = (expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0)

    return NextResponse.json({
      expenses,
      totalPending,
      totalPaid,
      total,
    })
  } catch (error) {
    console.error('[v0] Erro ao buscar despesas:', error)
    return NextResponse.json(
      {
        expenses: [],
        totalPending: 0,
        totalPaid: 0,
        total: 0,
        error: 'Supabase não configurado',
      },
      { status: 200 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      barbershop_id,
      title,
      description,
      amount,
      category,
      due_date,
      status,
      payment_method,
      payment_date,
      discount,
      interest,
      repeat_type,
      notes,
    } = body

    if (!barbershop_id || !title || !amount || !category || !due_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert({
        barbershop_id,
        title,
        description,
        amount,
        category,
        due_date,
        status: status || 'pending',
        payment_method,
        payment_date,
        discount: discount || 0,
        interest: interest || 0,
        repeat_type,
        notes,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ expense, success: true })
  } catch (error) {
    console.error('[v0] Erro ao criar despesa:', error)
    return NextResponse.json(
      { error: 'Failed to create expense', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    const { data: expense, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ expense, success: true })
  } catch (error) {
    console.error('[v0] Erro ao atualizar despesa:', error)
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = request.nextUrl
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Erro ao deletar despesa:', error)
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    )
  }
}
