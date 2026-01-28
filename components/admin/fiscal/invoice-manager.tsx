'use client'

import React from "react"

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Download, Send, Trash2, Plus } from 'lucide-react'
import type { FiscalInvoice } from '@/lib/fiscal/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const statusConfig = {
  pending: { label: 'Pendente', variant: 'outline' },
  authorized: { label: 'Autorizado', variant: 'default' },
  rejected: { label: 'Rejeitado', variant: 'destructive' },
  cancelled: { label: 'Cancelado', variant: 'secondary' },
}

const invoiceTypeConfig = {
  nfse: { label: 'NFS-e' },
  nfe: { label: 'NF-e' },
}

export function InvoiceManager() {
  const { data, isLoading } = useSWR<{ invoices: FiscalInvoice[] }>(
    '/api/fiscal/invoices',
    fetcher,
    { revalidateInterval: 5000 }
  )

  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<FiscalInvoice | null>(null)
  const [showEmitDialog, setShowEmitDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const [newInvoice, setNewInvoice] = useState({
    invoice_type: 'nfse',
    client_name: '',
    client_cpf_cnpj: '',
    client_email: '',
    service_description: '',
    total_amount: '',
  })

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const response = await fetch('/api/fiscal/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newInvoice,
          total_amount: parseFloat(newInvoice.total_amount),
        }),
      })

      if (!response.ok) throw new Error('Failed to create invoice')

      setNewInvoice({
        invoice_type: 'nfse',
        client_name: '',
        client_cpf_cnpj: '',
        client_email: '',
        service_description: '',
        total_amount: '',
      })
      setShowCreateDialog(false)
      mutate('/api/fiscal/invoices')

      toast({
        title: 'Sucesso',
        description: 'Nota fiscal criada com sucesso',
      })
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro ao criar nota',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleEmitInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/fiscal/invoices/${invoiceId}/emit`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to emit invoice')

      mutate('/api/fiscal/invoices')
      setShowEmitDialog(false)

      toast({
        title: 'Sucesso',
        description: 'Nota fiscal enviada para emissão',
      })
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro ao emitir nota',
        variant: 'destructive',
      })
    }
  }

  const handleCancelInvoice = async (invoiceId: string) => {
    if (!cancelReason.trim()) {
      toast({
        title: 'Erro',
        description: 'Informe o motivo do cancelamento',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch(`/api/fiscal/invoices/${invoiceId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      })

      if (!response.ok) throw new Error('Failed to cancel invoice')

      setCancelReason('')
      mutate('/api/fiscal/invoices')

      toast({
        title: 'Sucesso',
        description: 'Nota fiscal cancelada',
      })
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro ao cancelar nota',
        variant: 'destructive',
      })
    }
  }

  const invoices = data?.invoices || []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Notas Fiscais</CardTitle>
            <CardDescription>Gerencie suas notas fiscais (NFS-e e NF-e)</CardDescription>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Nota
          </Button>
        </CardHeader>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Criar Nova Nota Fiscal</DialogTitle>
            <DialogDescription>Preencha os dados do cliente e serviço</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_type">Tipo *</Label>
              <Select value={newInvoice.invoice_type} onValueChange={(value) => setNewInvoice({ ...newInvoice, invoice_type: value })}>
                <SelectTrigger id="invoice_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nfse">NFS-e (Serviço)</SelectItem>
                  <SelectItem value="nfe">NF-e (Produto)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_name">Cliente *</Label>
              <Input
                id="client_name"
                value={newInvoice.client_name}
                onChange={(e) => setNewInvoice({ ...newInvoice, client_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_cpf_cnpj">CPF/CNPJ</Label>
              <Input
                id="client_cpf_cnpj"
                value={newInvoice.client_cpf_cnpj}
                onChange={(e) => setNewInvoice({ ...newInvoice, client_cpf_cnpj: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_email">E-mail</Label>
              <Input
                id="client_email"
                type="email"
                value={newInvoice.client_email}
                onChange={(e) => setNewInvoice({ ...newInvoice, client_email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_description">Descrição do Serviço *</Label>
              <Textarea
                id="service_description"
                value={newInvoice.service_description}
                onChange={(e) => setNewInvoice({ ...newInvoice, service_description: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_amount">Valor Total (R$) *</Label>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                value={newInvoice.total_amount}
                onChange={(e) => setNewInvoice({ ...newInvoice, total_amount: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating && <Spinner className="mr-2 h-4 w-4" />}
                Criar Nota
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <Spinner className="h-8 w-8" />
        </div>
      ) : invoices.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Nenhuma nota fiscal criada ainda
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm font-semibold">
                        {invoice.invoice_number || 'Rascunho'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {invoiceTypeConfig[invoice.invoice_type].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{invoice.client_name}</TableCell>
                      <TableCell className="font-semibold">
                        R$ {invoice.total_amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[invoice.status].variant}>
                          {statusConfig[invoice.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(invoice.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {invoice.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedInvoice(invoice)
                                setShowEmitDialog(true)
                              }}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          {invoice.pdf_url && (
                            <Button size="sm" variant="ghost" asChild>
                              <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {invoice.status !== 'cancelled' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600"
                              onClick={() => {
                                setSelectedInvoice(invoice)
                                setCancelReason('')
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showEmitDialog} onOpenChange={setShowEmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Emitir Nota Fiscal</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja emitir a nota {selectedInvoice?.invoice_number}?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEmitDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => selectedInvoice && handleEmitInvoice(selectedInvoice.id)}
            >
              Emitir Nota
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedInvoice && !showEmitDialog} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Nota Fiscal</DialogTitle>
            <DialogDescription>
              Informe o motivo do cancelamento da nota {selectedInvoice?.invoice_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Motivo do cancelamento..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setSelectedInvoice(null)
                setCancelReason('')
              }}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedInvoice && handleCancelInvoice(selectedInvoice.id)}
              >
                Confirmar Cancelamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
