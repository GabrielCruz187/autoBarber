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

interface NovaComandaDialogProps {
  clientes: any[]
}

export function NovaComandaDialog({ clientes }: NovaComandaDialogProps) {
  const [open, setOpen] = useState(false)
  const [clienteId, setClienteId] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [total, setTotal] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Permitir apenas números e um ponto decimal
    if (/^\d*\.?\d*$/.test(value)) {
      setTotal(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!clienteId) {
      toast.error(t.common.erro, { description: 'Selecione um cliente' })
      return
    }

    if (!total || parseFloat(total) <= 0) {
      toast.error(t.common.erro, { description: 'Insira um valor maior que zero' })
      return
    }

    setIsLoading(true)
    try {
      const totalAmount = parseFloat(total)
      
      const response = await fetch('/api/admin/comandas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: clienteId || null,
          observacoes: observacoes || null,
          total: totalAmount,
        }),
      })

      if (!response.ok) throw new Error('Erro ao criar comanda')

      toast.success(t.common.sucesso, { 
        description: `Comanda criada! Valor: R$ ${totalAmount.toFixed(2)}` 
      })
      setOpen(false)
      setClienteId('')
      setObservacoes('')
      setTotal('')
    } catch (error) {
      console.error('[v0] Erro ao criar comanda:', error)
      toast.error(t.common.erro, { description: 'Erro ao criar comanda' })
    } finally {
      setIsLoading(false)
    }
  }

  const totalValue = total ? parseFloat(total) : 0
  const formattedTotal = totalValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t.comandas.novaComanda}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.comandas.novaComanda}</DialogTitle>
          <DialogDescription>Crie uma nova comanda para registrar pedidos</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cliente">{t.comandas.cliente}</Label>
            <select
              id="cliente"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              disabled={isLoading}
            >
              <option value="">{t.common.semCliente}</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.first_name} {cliente.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="total">Valor Total (R$) *</Label>
            <Input
              id="total"
              type="text"
              placeholder="0,00"
              value={total}
              onChange={handleTotalChange}
              disabled={isLoading}
              className="text-base"
            />
            {total && totalValue > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Valor: <span className="font-bold text-foreground">R$ {formattedTotal}</span>
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Input
              id="observacoes"
              placeholder="Notas sobre a comanda..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3">
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




