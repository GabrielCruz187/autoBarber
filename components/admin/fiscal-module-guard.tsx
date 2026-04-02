'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Unlock } from 'lucide-react'
import Link from 'next/link'

interface FiscalModuleGuardProps {
  isEnabled: boolean
  barbershopId: string
  children: React.ReactNode
}

export function FiscalModuleGuard({
  isEnabled,
  barbershopId,
  children,
}: FiscalModuleGuardProps) {
  if (isEnabled) {
    return <>{children}</>
  }

  return (
    <Card className="border-2 border-dashed border-amber-200 bg-amber-50">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-amber-100 rounded-full">
            <Lock className="h-6 w-6 text-amber-600" />
          </div>
        </div>
        <CardTitle className="text-xl">Módulo Fiscal Bloqueado</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 text-center">
        <div className="bg-white rounded-lg p-4 space-y-3">
          <p className="text-sm text-amber-900">
            O módulo fiscal está disponível apenas no plano <strong>Sistema + Fiscal</strong>
          </p>
          <p className="text-xs text-amber-800">
            Upgrade seu plano para R$ 4.000/ano e tenha acesso a:
          </p>
          <ul className="text-sm text-left space-y-1">
            <li>✓ Emissão de Notas Fiscais Eletrônicas (NFe)</li>
            <li>✓ Integração com Cibradi e Sefaz</li>
            <li>✓ Registro automático de transações</li>
            <li>✓ Suporte prioritário</li>
          </ul>
        </div>

        <Button asChild className="w-full">
          <Link href={`/checkout?barbershopId=${barbershopId}&upgrade=fiscal`}>
            <Unlock className="mr-2 h-4 w-4" />
            Upgrade para Plano Fiscal
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
