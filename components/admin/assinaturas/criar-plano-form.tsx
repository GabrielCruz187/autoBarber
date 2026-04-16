'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

export function CriarPlanoForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    frequencia: 'mensal',
    color: '#7c3aed',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome || !formData.preco) {
      toast.error('Erro', { description: 'Preencha os campos obrigatórios' })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/assinaturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          descricao: formData.descricao,
          preco: parseFloat(formData.preco),
          frequencia: formData.frequencia,
          color: formData.color,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar plano')
      }

      toast.success('Sucesso', { description: 'Plano criado com sucesso!' })
      setFormData({ nome: '', descricao: '', preco: '', frequencia: 'mensal', color: '#7c3aed' })
    } catch (error) {
      toast.error('Erro', { description: error instanceof Error ? error.message : 'Erro ao criar plano' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nome">Nome do Plano *</Label>
          <Input
            id="nome"
            placeholder="Ex: Plano Premium"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            placeholder="Descreva os benefícios do plano"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            disabled={isLoading}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="preco">Preço *</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.preco}
              onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="frequencia">Frequência</Label>
            <Select value={formData.frequencia} onValueChange={(value) => setFormData({ ...formData, frequencia: value })}>
              <SelectTrigger id="frequencia" disabled={isLoading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="trimestral">Trimestral</SelectItem>
                <SelectItem value="semestral">Semestral</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="color">Cor do Plano</Label>
          <div className="flex gap-2">
            <Input
              id="color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              disabled={isLoading}
              className="w-12 h-10 p-1 cursor-pointer"
            />
            <Input
              type="text"
              placeholder="#7c3aed"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              disabled={isLoading}
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Escolha uma cor para identificar este plano na agenda</p>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Criando...' : 'Criar Plano'}
        </Button>
      </form>
    </Card>
  )
}

