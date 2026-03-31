import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    const { data: barbershop, error } = await supabase
      .from('barbershops')
      .select('id, name, slug')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !barbershop) {
      return NextResponse.json(
        { error: 'Barbearia não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: barbershop.id,
      name: barbershop.name,
      slug: barbershop.slug
    }, { status: 200 })
  } catch (error) {
    console.error('[v0] Erro ao buscar barbearia:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar barbearia' },
      { status: 500 }
    )
  }
}
