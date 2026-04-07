'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function BarbershopSignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.ownerName || !formData.email || !formData.phone || !formData.password) {
      toast.error('Erro', { description: 'Preencha todos os campos obrigatórios' })
      return
    }

    if (formData.password.length < 6) {
      toast.error('Erro', { description: 'Senha deve ter pelo menos 6 caracteres' })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/barbershop/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar barbearia')
      }

      toast.success('Sucesso!', {
        description: 'Barbearia criada com sucesso. Iniciando período de teste de 7 dias...',
      })

      // Redirecionar para checkout com barbershopId
      router.push(`/checkout?barbershopId=${data.barbershop.id}`)
    } catch (error) {
      toast.error('Erro', {
        description: error instanceof Error ? error.message : 'Erro ao criar barbearia',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5 py-12 px-4 flex items-center">
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Crie sua Barbearia</CardTitle>
            <CardDescription>
              Comece com 7 dias grátis de acesso completo ao sistema
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="ownerName">Seu Nome Completo</Label>
                <Input
                  id="ownerName"
                  name="ownerName"
                  placeholder="João Silva"
                  value={formData.ownerName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="(11) 9 9999-9999"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Criando...' : 'Criar Barbearia'}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 grid gap-3 text-sm">
          <div className="flex gap-2">
            <div className="text-green-600 font-bold">✓</div>
            <div>7 dias de acesso completo grátis</div>
          </div>
          <div className="flex gap-2">
            <div className="text-green-600 font-bold">✓</div>
            <div>Sem cartão de crédito obrigatório</div>
          </div>
          <div className="flex gap-2">
            <div className="text-green-600 font-bold">✓</div>
            <div>Cancele a qualquer momento</div>
          </div>
        </div>
      </div>
    </div>
  )
}
