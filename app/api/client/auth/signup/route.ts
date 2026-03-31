import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] POST /api/client/auth/signup - iniciando')
    
    const body = await request.json()
    const { firstName, lastName, phone, cpf, password, barbershopId } = body

    if (!firstName || !lastName || !phone || !cpf || !password || !barbershopId) {
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

    // Verificar se cliente já existe com este telefone na barbearia
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('phone', phone)
      .eq('barbershop_id', barbershopId)
      .single()

    if (existingClient) {
      console.log('[v0] Cliente com este telefone já existe:', phone)
      return NextResponse.json(
        { error: 'Cliente com este telefone já está registrado' },
        { status: 409 }
      )
    }

    // Verificar se CPF já existe na barbearia
    const { data: existingCpf } = await supabase
      .from('clients')
      .select('id')
      .eq('cpf', cpf)
      .eq('barbershop_id', barbershopId)
      .single()

    if (existingCpf) {
      console.log('[v0] Cliente com este CPF já existe:', cpf)
      return NextResponse.json(
        { error: 'Cliente com este CPF já está registrado' },
        { status: 409 }
      )
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10)

    console.log('[v0] Inserindo novo cliente:', { firstName, lastName, phone, cpf, barbershopId })

    // Criar novo cliente
    const { data: newClient, error: createError } = await supabase
      .from('clients')
      .insert({
        first_name: firstName,
        last_name: lastName,
        phone,
        cpf,
        password_hash: passwordHash,
        barbershop_id: barbershopId,
      })
      .select()
      .single()

    if (createError) {
      console.error('[v0] Erro ao criar cliente:', createError)
      return NextResponse.json(
        { error: `Erro ao criar conta: ${createError.message}` },
        { status: 500 }
      )
    }

    if (!newClient) {
      console.error('[v0] Cliente não foi retornado após insert')
      return NextResponse.json(
        { error: 'Erro ao criar conta' },
        { status: 500 }
      )
    }

    // Gerar token
    const token = Buffer.from(JSON.stringify({ 
      clientId: newClient.id, 
      barbershopId: newClient.barbershop_id,
      timestamp: Date.now()
    })).toString('base64')

    console.log('[v0] Cliente criado com sucesso:', newClient.id)

    return NextResponse.json({
      success: true,
      token,
      clientId: newClient.id,
      client: {
        id: newClient.id,
        firstName: newClient.first_name,
        lastName: newClient.last_name,
        phone: newClient.phone,
        cpf: newClient.cpf,
      }
    }, { status: 201 })
  } catch (error) {
    console.error('[v0] Erro na rota de signup:', error)
    return NextResponse.json(
      { error: 'Erro ao criar conta' },
      { status: 500 }
    )
  }
}
