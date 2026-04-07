import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip middleware se as variáveis de Supabase não estão configuradas
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn('[v0] Variáveis de Supabase não configuradas, pulando middleware')
    return NextResponse.next()
  }

  // Se tiver variáveis, tentar atualizar sessão
  try {
    const { updateSession } = await import('@/lib/supabase/proxy')
    return await updateSession(request)
  } catch (error) {
    console.error('[v0] Erro ao atualizar sessão:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
