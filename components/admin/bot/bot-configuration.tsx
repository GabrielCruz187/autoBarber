'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Copy, Eye, EyeOff } from 'lucide-react'

export function BotConfiguration() {
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [verifyToken, setVerifyToken] = useState('')
  const [showTokens, setShowTokens] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!phoneNumberId || !accessToken || !verifyToken) {
      toast.error('Todos os campos são obrigatórios')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/admin/bot/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumberId,
          accessToken,
          verifyToken,
          isActive,
        }),
      })

      if (!response.ok) throw new Error('Falha ao salvar')
      toast.success('Configuração salva com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar configuração')
      console.error('[v0] Config save error:', error)
    } finally {
      setSaving(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado para área de transferência')
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Credenciais WhatsApp</CardTitle>
          <CardDescription>
            Configure seu acesso à WhatsApp Cloud API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="phone-id">Phone Number ID</Label>
            <div className="flex gap-2">
              <Input
                id="phone-id"
                placeholder="123456789..."
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(phoneNumberId)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="access-token">Access Token</Label>
            <div className="flex gap-2">
              <Input
                id="access-token"
                type={showTokens ? 'text' : 'password'}
                placeholder="EAAx..."
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowTokens(!showTokens)}
              >
                {showTokens ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(accessToken)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verify-token">Verify Token</Label>
            <div className="flex gap-2">
              <Input
                id="verify-token"
                type={showTokens ? 'text' : 'password'}
                placeholder="Qualquer string aleatória"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(verifyToken)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="active"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked as boolean)}
            />
            <Label htmlFor="active" className="font-normal cursor-pointer">
              Ativar bot (o webhook deve estar verificado no Meta Business)
            </Label>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Salvando...' : 'Salvar Configuração'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook URL</CardTitle>
          <CardDescription>
            Use esta URL no Meta Business Dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <code className="flex-1 bg-muted p-3 rounded text-xs break-all">
              {`${typeof window !== 'undefined' ? window.location.origin : ''}/api/whatsapp/webhook`}
            </code>
            <Button
              variant="outline"
              onClick={() =>
                copyToClipboard(
                  `${typeof window !== 'undefined' ? window.location.origin : ''}/api/whatsapp/webhook`
                )
              }
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
