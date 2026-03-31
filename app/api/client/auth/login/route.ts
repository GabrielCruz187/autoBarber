import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] POST /api/client/auth/login - iniciando')
    
    const body = await request.json()
    const { phone, password } = body

    if (!phone || !password) {
      return NextResponse.json(
        { error: 'Telefone e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Buscar cliente pelo telefone
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('phone', phone)
      .single()

    if (error || !client) {
      console.log('[v0] Cliente não encontrado:', phone)
      return NextResponse.json(
        { error: 'Telefone ou senha inválidos' },
        { status: 401 }
      )
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, client.password_hash)
    
    if (!passwordMatch) {
      console.log('[v0] Senha incorreta para cliente:', phone)
      return NextResponse.json(
        { error: 'Telefone ou senha inválidos' },
        { status: 401 }
      )
    }

    // Gerar token simples (em produção, usar JWT)
    const token = Buffer.from(JSON.stringify({ 
      clientId: client.id, 
      barbershopId: client.barbershop_id,
      timestamp: Date.now()
    })).toString('base64')

    console.log('[v0] Login bem-sucedido para cliente:', client.id)

    return NextResponse.json({
      success: true,
      token,
      clientId: client.id,
      client: {
        id: client.id,
        firstName: client.first_name,
        lastName: client.last_name,
        phone: client.phone,
        cpf: client.cpf,
      }
    }, { status: 200 })
  } catch (error) {
    console.error('[v0] Erro na rota de login:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    )
  }
}
