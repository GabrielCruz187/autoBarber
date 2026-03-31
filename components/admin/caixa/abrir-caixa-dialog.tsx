'use client'

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus } from "lucide-react"

interface AbrirCaixaDialogProps {
  caixaAberta: boolean
}

export function AbrirCaixaDialog({ caixaAberta }: AbrirCaixaDialogProps) {
  const [open, setOpen] = useState(false)
  const [saldoInicial, setSaldoInicial] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!saldoInicial || parseFloat(saldoInicial) < 0) {
      toast.error("Erro", { description: "Digite um saldo inicial válido" })
      return
    }

    setIsLoading(true)
    try {
      console.log("[v0] Abrindo caixa com saldo inicial:", saldoInicial)
      const response = await fetch('/api/admin/caixa/abrir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saldo_inicial: parseFloat(saldoInicial),
        }),
      })

      const data = await response.json()
      console.log("[v0] Response:", response.status, data)

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao abrir caixa')
      }

      toast.success("Sucesso!", { description: "Caixa aberto com sucesso!" })
      setSaldoInicial('')
      setOpen(false)
      window.location.reload()
    } catch (error) {
      console.error("[v0] Erro ao abrir caixa:", error)
      toast.error("Erro", { description: error instanceof Error ? error.message : 'Erro ao abrir caixa' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={caixaAberta}>
          <Plus className="mr-2 h-4 w-4" />
          {caixaAberta ? "Caixa já está aberto" : "Abrir Caixa"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abrir Caixa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="saldo">Saldo Inicial (R$)</Label>
            <Input
              id="saldo"
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={saldoInicial}
              onChange={(e) => setSaldoInicial(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Abrindo...' : 'Abrir Caixa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
