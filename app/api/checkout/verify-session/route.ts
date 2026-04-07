import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] POST /api/checkout/verify-session')

    const body = await request.json()
    const { sessionId, barbershopId } = body

    if (!sessionId || !barbershopId) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios faltando' },
        { status: 400 }
      )
    }

    // Buscar sessão no Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      console.log('[v0] Pagamento não confirmado:', sessionId)
      return NextResponse.json(
        { error: 'Pagamento não foi confirmado' },
        { status: 400 }
      )
    }

    // Verificar se Supabase está configurado
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.log('[v0] Supabase não configurado, apenas retornando sucesso')
      return NextResponse.json(
        {
          success: true,
          message: 'Pagamento confirmado com sucesso',
          planType: (session.metadata?.planType as 'basic' | 'premium') || 'basic',
        },
        { status: 200 }
      )
    }

    try {
      const supabase = await createClient()

      // Determinar plano a partir da metadata
      const planType = (session.metadata?.planType as 'basic' | 'premium') || 'basic'

      // Atualizar barbearia com informações de assinatura
      const { error: updateError } = await supabase
        .from('barbershops')
        .update({
          subscription_status: 'active',
          subscription_plan: planType,
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          stripe_subscription_id: session.subscription,
          has_trial_used: true,
        })
        .eq('id', barbershopId)

      if (updateError) {
        console.error('[v0] Erro ao atualizar barbearia:', updateError)
      }

      // Se é plano premium, habilitar módulo fiscal
      if (planType === 'premium') {
        await supabase
          .from('barbershops')
          .update({ fiscal_module_enabled: true })
          .eq('id', barbershopId)
      }

      console.log('[v0] Assinatura ativada para barbearia:', barbershopId, 'plano:', planType)
    } catch (dbError) {
      console.error('[v0] Erro ao atualizar banco de dados:', dbError)
      // Não falhar o pagamento se o banco tiver problema
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Assinatura ativada com sucesso',
        planType: (session.metadata?.planType as 'basic' | 'premium') || 'basic',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Erro ao verificar sessão:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar pagamento', details: error instanceof Error ? error.message : 'Desconhecido' },
      { status: 500 }
    )
  }
}
