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
  const [isLoading, setIsLoading] = useState(false)
  const [descricao, setDescricao] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!clienteId) {
      toast.error(t.common.erro, { description: 'Selecione um cliente' })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/comandas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: clienteId || null,
          observacoes: observacoes || null,
        }),
      })

      if (!response.ok) throw new Error('Erro ao criar comanda')

      toast.success(t.common.sucesso, { description: 'Comanda criada com sucesso!' })
      setOpen(false)
      setClienteId('')
      setObservacoes('')
    } catch (error) {
      toast.error(t.common.erro, { description: 'Erro ao criar comanda' })
    } finally {
      setIsLoading(false)
    }
  }

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
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Input
              id="observacoes"
              placeholder="Notas sobre a comanda..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
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


