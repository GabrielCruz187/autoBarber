'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Zap, Link2, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface GamificationConfig {
  id: string
  is_enabled: boolean
  app_url: string | null
  discount_percent: number | null
}

export default function GamificationPage() {
  const [config, setConfig] = useState<GamificationConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [appUrl, setAppUrl] = useState('')
  const [discountPercent, setDiscountPercent] = useState('0')
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/gamification/config')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setConfig(data)
      setAppUrl(data.app_url || '')
      setDiscountPercent(String(data.discount_percent || 0))
      setIsEnabled(data.is_enabled)
    } catch (error) {
      console.error('[v0] Error fetching gamification config:', error)
      toast.error('Erro ao carregar configuração')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (isEnabled && !appUrl.trim()) {
      toast.error('URL do app é obrigatória')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/admin/gamification/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_enabled: isEnabled,
          app_url: appUrl || null,
          discount_percent: discountPercent ? parseFloat(discountPercent) : null,
        }),
      })

      if (!response.ok) throw new Error('Failed to save')
      toast.success('Configuração salva com sucesso!')
      await fetchConfig()
    } catch (error) {
      toast.error('Erro ao salvar configuração')
      console.error('[v0] Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-20">Carregando...</div>
  }

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/agendamento/referral?discount=${discountPercent}`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gamificação</h1>
        <p className="text-muted-foreground mt-2">
          Integre com seu app de pontos e ofereça descontos aos clientes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Ativar Gamificação
          </CardTitle>
          <CardDescription>
            Permita que clientes acumulem pontos e ganhem descontos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3">
            <Checkbox
              id="enable"
              checked={isEnabled}
              onCheckedChange={(checked) => setIsEnabled(checked as boolean)}
            />
            <Label htmlFor="enable" className="font-normal cursor-pointer">
              Ativar integração com programa de pontos
            </Label>
          </div>

          {isEnabled && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="app-url">URL do App de Gamificação</Label>
                <Input
                  id="app-url"
                  placeholder="https://seu-app-gamificacao.com"
                  value={appUrl}
                  onChange={(e) => setAppUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Clientes serão redirecionados para este link com referral ID
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Desconto para Novo Cliente (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="10"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Desconto automático quando cliente se cadastra via link de referência
                </p>
              </div>

              <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium">Link de Referência</p>
                <div className="flex gap-2">
                  <code className="flex-1 bg-white p-2 rounded text-xs break-all border">
                    {referralLink}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(referralLink)
                      toast.success('Link copiado!')
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium">Como Funciona</p>
                <ol className="text-xs space-y-2 list-decimal list-inside text-green-900">
                  <li>Compartilhe o link acima com seus clientes</li>
                  <li>Clientes clicam no link e acessam seu app de gamificação</li>
                  <li>Sistema sincroniza pontos via webhook</li>
                  <li>Desconto automático aplicado no primeiro agendamento</li>
                </ol>
              </div>
            </div>
          )}

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Salvando...' : 'Salvar Configuração'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook de Sincronização</CardTitle>
          <CardDescription>
            Configure este webhook em seu app de gamificação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">URL do Webhook</p>
            <div className="flex gap-2">
              <code className="flex-1 bg-muted p-3 rounded text-xs break-all">
                {typeof window !== 'undefined'
                  ? `${window.location.origin}/api/gamification/webhook`
                  : 'https://seu-app.com/api/gamification/webhook'}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${typeof window !== 'undefined' ? window.location.origin : ''}/api/gamification/webhook`
                  )
                  toast.success('Copiado!')
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Payload Esperado</p>
            <pre className="bg-muted p-3 rounded text-xs overflow-auto">
{`{
  "customerId": "uuid",
  "points": 100,
  "action": "earned" | "spent",
  "description": "Agendamento concluído"
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
