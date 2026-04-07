import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] POST /api/barbershop/signup')

    const body = await request.json()
    const { name, email, phone, ownerName, password } = body

    if (!name || !email || !phone || !ownerName || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verificar se email já existe
    const { data: existingBarbershop } = await supabase
      .from('barbershops')
      .select('id')
      .eq('owner_email', email)
      .single()

    if (existingBarbershop) {
      return NextResponse.json(
        { error: 'Email já está registrado' },
        { status: 409 }
      )
    }

    // Criar usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: ownerName,
        },
      },
    })

    if (authError || !authData.user) {
      console.error('[v0] Erro ao criar usuário:', authError)
      return NextResponse.json(
        { error: 'Erro ao criar conta' },
        { status: 500 }
      )
    }

    // Gerar slug único para a barbearia
    const slug = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`

    // Calcular datas de trial
    const trialStartDate = new Date()
    const trialEndDate = new Date(trialStartDate)
    trialEndDate.setDate(trialEndDate.getDate() + 7)

    // Criar barbearia com trial de 7 dias
    const { data: barbershop, error: barbershopError } = await supabase
      .from('barbershops')
      .insert({
        name,
        slug,
        owner_id: authData.user.id,
        owner_name: ownerName,
        owner_email: email,
        phone,
        trial_start_date: trialStartDate.toISOString(),
        trial_end_date: trialEndDate.toISOString(),
        subscription_status: 'trial',
        has_trial_used: false,
        is_active: true,
      })
      .select()
      .single()

    if (barbershopError || !barbershop) {
      console.error('[v0] Erro ao criar barbearia:', barbershopError)
      return NextResponse.json(
        { error: 'Erro ao criar barbearia' },
        { status: 500 }
      )
    }

    console.log('[v0] Barbearia criada com sucesso:', barbershop.id, 'Trial até:', trialEndDate)

    return NextResponse.json(
      {
        success: true,
        message: 'Barbearia criada com sucesso! Você tem 7 dias de teste gratuito.',
        barbershop: {
          id: barbershop.id,
          name: barbershop.name,
          slug: barbershop.slug,
          trialEndDate: trialEndDate.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Erro na rota de signup:', error)
    return NextResponse.json(
      { error: 'Erro ao criar conta' },
      { status: 500 }
    )
  }
}
