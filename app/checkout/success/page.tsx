'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isVerifying, setIsVerifying] = useState(true)
  const [planType, setPlanType] = useState<string>('')

  const sessionId = searchParams.get('session_id')
  const barbershopId = searchParams.get('barbershopId')
  const plan = searchParams.get('planType')

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!sessionId || !barbershopId) {
          throw new Error('Parâmetros faltando')
        }

        setPlanType(plan || '')

        // Verificar pagamento com servidor
        const response = await fetch(`/api/checkout/verify-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, barbershopId }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao verificar pagamento')
        }

        setIsVerifying(false)
        toast.success('Pagamento confirmado!', {
          description: 'Sua assinatura foi ativada com sucesso',
        })
      } catch (error) {
        console.error('[v0] Erro ao verificar pagamento:', error)
        toast.error('Erro', {
          description: error instanceof Error ? error.message : 'Erro ao verificar pagamento',
        })
        setIsVerifying(false)
      }
    }

    verifyPayment()
  }, [sessionId, barbershopId])

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-12 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Verificando seu pagamento...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl" />
              <CheckCircle2 className="w-16 h-16 text-green-500 relative animate-bounce" />
            </div>
          </div>
          <CardTitle className="text-2xl">Pagamento Confirmado!</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
            <p className="text-green-900 font-semibold">Obrigado por assinar!</p>
            <p className="text-sm text-green-800">
              Sua assinatura está ativa e você já pode começar a usar o sistema. Você receberá um email com os detalhes
              da sua fatura.
            </p>
            {planType === 'premium' && (
              <p className="text-sm text-green-800">
                ✓ Módulo Fiscal está habilitado em sua conta
              </p>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Próximas etapas:</h4>
            <ul className="text-sm space-y-2 list-disc list-inside">
              <li>Acesse seu painel administrativo</li>
              <li>Configure suas informações de barbearia</li>
              <li>Comece a receber agendamentos</li>
              {planType === 'premium' && <li>Configure seu módulo fiscal</li>}
            </ul>
          </div>

          <Button
            onClick={() => router.push('/admin')}
            className="w-full"
            size="lg"
          >
            Ir para o Painel Administrativo
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-12 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Verificando seu pagamento...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}

