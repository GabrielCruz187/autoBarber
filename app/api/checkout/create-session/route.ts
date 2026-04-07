import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

const PRICES = {
  basic: 300000, // 3000 em centavos
  premium: 400000, // 4000 em centavos
}

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] POST /api/checkout/create-session')

    const body = await request.json()
    const { barbershopId, planType, amount } = body

    if (!barbershopId || !planType || !amount) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios faltando' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Buscar barbearia
    const { data: barbershop, error: barbershopError } = await supabase
      .from('barbershops')
      .select('*')
      .eq('id', barbershopId)
      .single()

    if (barbershopError || !barbershop) {
      console.error('[v0] Barbearia não encontrada:', barbershopId)
      return NextResponse.json(
        { error: 'Barbearia não encontrada' },
        { status: 404 }
      )
    }

    // Usar ou criar Stripe Customer ID
    let stripeCustomerId = barbershop.stripe_customer_id

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: barbershop.owner_email,
        name: barbershop.name,
        metadata: {
          barbershopId: barbershop.id,
        },
      })
      stripeCustomerId = customer.id

      // Salvar customer ID no banco
      await supabase
        .from('barbershops')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', barbershopId)
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: planType === 'basic' ? 'Plano Sistema' : 'Plano Sistema + Fiscal',
              description:
                planType === 'basic'
                  ? 'Acesso ao sistema de agendamentos por 1 ano'
                  : 'Sistema de agendamentos + Módulo Fiscal (NFe) por 1 ano',
            },
            recurring: {
              interval: 'year',
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&barbershopId=${barbershopId}&planType=${planType}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel?barbershopId=${barbershopId}`,
      metadata: {
        barbershopId,
        planType,
      },
    })

    console.log('[v0] Sessão de checkout criada:', session.id)

    return NextResponse.json({ url: session.url }, { status: 200 })
  } catch (error) {
    console.error('[v0] Erro ao criar sessão de checkout:', error)
    return NextResponse.json(
      { error: 'Erro ao processar pagamento' },
      { status: 500 }
    )
  }
}
