'use client'

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Edit, CheckCircle } from "lucide-react"

interface EditarComandaDialogProps {
  comanda: any
}

export function EditarComandaDialog({ comanda }: EditarComandaDialogProps) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(comanda.status)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsLoading(true)
    try {
      console.log("[v0] Atualizando comanda com status:", status)
      const response = await fetch(`/api/admin/comandas/${comanda.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()
      console.log("[v0] Response:", response.status, data)

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar comanda')
      }

      toast.success("Sucesso!", { description: "Comanda atualizada com sucesso!" })
      setOpen(false)
    } catch (error) {
      console.error("[v0] Erro ao atualizar comanda:", error)
      toast.error("Erro", { description: error instanceof Error ? error.message : 'Erro ao atualizar comanda' })
    } finally {
      setIsLoading(false)
    }
  }

  const isPaid = status === 'paga'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {isPaid ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Paga
            </>
          ) : (
            <>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Comanda</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="aberta">Aberta</option>
              <option value="paga">Paga</option>
              <option value="cancelada">Cancelada</option>
            </select>
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
              {isLoading ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

