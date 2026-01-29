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

export function NovoProdutoDialog() {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState('geral')
  const [preco, setPreco] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [quantidadeMinima, setQuantidadeMinima] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nome || !preco || !quantidade) {
      toast.error(t.common.erro, { description: 'Preencha todos os campos obrigatórios' })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/estoque/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          categoria: categoria || 'geral',
          preco: parseFloat(preco),
          quantidade: parseInt(quantidade),
          quantidade_minima: parseInt(quantidadeMinima) || 10,
        }),
      })

      if (!response.ok) throw new Error('Erro ao adicionar produto')

      toast.success(t.common.sucesso, { description: 'Produto adicionado com sucesso!' })
      setOpen(false)
      setNome('')
      setCategoria('geral')
      setPreco('')
      setQuantidade('')
      setQuantidadeMinima('')
    } catch (error) {
      toast.error(t.common.erro, { description: 'Erro ao adicionar produto' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t.estoque.adicionarProduto}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.estoque.adicionarProduto}</DialogTitle>
          <DialogDescription>Adicione um novo produto ao estoque</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">{t.estoque.nomeProduto}</Label>
            <Input
              id="nome"
              placeholder="Nome do produto"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="categoria">{t.estoque.categoria}</Label>
            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="geral">Geral</option>
              <option value="higiene">Higiene</option>
              <option value="ferramentas">Ferramentas</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preco">{t.estoque.preco}</Label>
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
              <Label htmlFor="quantidade">{t.estoque.quantidade}</Label>
              <Input
                id="quantidade"
                placeholder="0"
                type="number"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="quantidadeMinima">{t.estoque.quantidadeMinima}</Label>
            <Input
              id="quantidadeMinima"
              placeholder="10"
              type="number"
              value={quantidadeMinima}
              onChange={(e) => setQuantidadeMinima(e.target.value)}
            />
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
              {isLoading ? 'Adicionando...' : t.common.criar}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
