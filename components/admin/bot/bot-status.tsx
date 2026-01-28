'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface BotConfig {
  id: string
  is_active: boolean
  webhook_url: string | null
  last_test_at: string | null
  created_at: string
}

export function BotStatus() {
  const [config, setConfig] = useState<BotConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/bot/config')
      if (!response.ok) throw new Error('Failed to fetch config')
      const data = await response.json()
      setConfig(data)
    } catch (error) {
      console.error('[v0] Error fetching bot config:', error)
      toast.error('Failed to load bot status')
    } finally {
      setLoading(false)
    }
  }

  const handleTestWebhook = async () => {
    setTesting(true)
    try {
      const response = await fetch('/api/admin/bot/test', { method: 'POST' })
      if (!response.ok) throw new Error('Test failed')
      toast.success('Webhook test successful!')
      await fetchConfig()
    } catch (error) {
      toast.error('Webhook test failed')
      console.error('[v0] Webhook test error:', error)
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Status do Bot</span>
            <Badge variant={config?.is_active ? 'default' : 'secondary'}>
              {config?.is_active ? '✓ Ativo' : '○ Inativo'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Monitorar saúde e atividade do seu bot WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Webhook URL</p>
              <code className="text-xs bg-muted p-3 rounded block break-all">
                {config?.webhook_url || 'Não configurado'}
              </code>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Criado em</p>
              <p className="text-sm">
                {config?.created_at
                  ? new Date(config.created_at).toLocaleDateString('pt-BR')
                  : 'N/A'}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Último teste</p>
              <p className="text-sm">
                {config?.last_test_at
                  ? new Date(config.last_test_at).toLocaleString('pt-BR')
                  : 'Nunca testado'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Verificação de Webhook</p>
                <p className="text-blue-700">
                  Teste se seu webhook está funcionando corretamente
                </p>
              </div>
            </div>

            <Button onClick={handleTestWebhook} disabled={testing || !config?.is_active}>
              {testing ? 'Testando...' : 'Testar Webhook'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Webhook</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Para ativar seu bot no Meta Business:</p>
            <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
              <li>Vá para Meta Business Dashboard</li>
              <li>Selecione seu WhatsApp Business Account</li>
              <li>Configure o webhook com a URL acima</li>
              <li>Use o verify token da aba "Configuração"</li>
              <li>Clique em "Teste" para confirmar</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
