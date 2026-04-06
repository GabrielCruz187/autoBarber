'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function CheckoutCancelPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const barbershopId = searchParams.get('barbershopId')

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Pagamento Cancelado</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
            <p className="text-red-900 font-semibold">Sua sessão de pagamento foi cancelada</p>
            <p className="text-sm text-red-800">
              Você pode tentar novamente ou entrar em contato com nosso suporte se tiver dúvidas.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push(`/checkout?barbershopId=${barbershopId}`)}
              className="w-full"
              size="lg"
            >
              Tentar Novamente
            </Button>
            <Button
              onClick={() => router.push('/admin')}
              variant="outline"
              className="w-full"
            >
              Voltar ao Painel
            </Button>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Seu período de teste continua válido até que você conclua o pagamento
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
