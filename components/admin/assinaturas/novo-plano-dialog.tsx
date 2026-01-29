'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { t } from '@/lib/i18n/useTranslation'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

interface NovoPlanoDialogProps {
  onPlanoCriado: () => void;
}

export function NovoPlanoDialog({ onPlanoCriado }: NovoPlanoDialogProps) {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [preco, setPreco] = useState('')
  const [frequencia, setFrequencia] = useState('mensal')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nome || !preco) {
      toast.error(t.common.erro, { description: 'Preencha todos os campos obrigatórios' })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/assinaturas/planos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          descricao: descricao || null,
          preco: parseFloat(preco),
          frequencia,
        }),
      })

      if (!response.ok) throw new Error('Erro ao criar plano')

      toast.success(t.common.sucesso, { description: 'Plano de assinatura criado com sucesso!' })
      setOpen(false)
      setNome('')
      setDescricao('')
      setPreco('')
      setFrequencia('mensal')
    } catch (error) {
      toast.error(t.common.erro, { description: 'Erro ao criar plano de assinatura' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t.assinaturas.criarPlano}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.assinaturas.criarPlano}</DialogTitle>
          <DialogDescription>Crie um novo plano de assinatura</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">{t.assinaturas.nomePlano}</Label>
            <Input
              id="nome"
              placeholder="Ex: Premium Plus"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">{t.assinaturas.descricaoPlano}</Label>
            <Input
              id="descricao"
              placeholder="Descrição do plano"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preco">{t.assinaturas.preco}</Label>
              <Input
                id="preco"
                placeholder="0.00"
                type="number"
                step="0.01"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="frequencia">{t.assinaturas.frequencia}</Label>
              <select
                id="frequencia"
                value={frequencia}
                onChange={(e) => setFrequencia(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="mensal">{t.assinaturas.mensal}</option>
                <option value="trimestral">{t.assinaturas.trimestral}</option>
                <option value="anual">{t.assinaturas.anual}</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              {t.common.cancelar}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Criando...' : t.common.criar}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

