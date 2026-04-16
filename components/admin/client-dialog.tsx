"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, DollarSign, Scissors, XCircle, CreditCard } from "lucide-react"
import { toast } from "sonner"
import type { Client } from "@/lib/types"

interface ClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  barbershopId: string
  client?: Client & {
    metrics?: {
      total_spent?: number
      total_completed?: number
      no_show_count?: number
      cancellation_count?: number
      subscription_status?: string
      plan_name?: string
      plan_color?: string
    }
  } | null
}

export function ClientDialog({ open, onOpenChange, barbershopId, client }: ClientDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [metrics, setMetrics] = useState(client?.metrics || null)
  const [formData, setFormData] = useState({
    first_name: client?.first_name || "",
    last_name: client?.last_name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    notes: client?.notes || "",
    is_vip: client?.is_vip || false,
  })

  // Fetch metrics when dialog opens
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!client?.id || !open) return
      
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("clients")
          .select(`
            id,
            total_spent,
            total_visits,
            no_show_count,
            cancellation_count,
            subscriptions(
              id,
              status,
              planos_assinatura(
                nome,
                color
              )
            )
          `)
          .eq("id", client.id)
          .single()

        if (data) {
          const subscription = data.subscriptions?.[0]
          const plan = subscription?.planos_assinatura?.[0]
          setMetrics({
            total_spent: data.total_spent || 0,
            total_completed: data.total_visits || 0,
            no_show_count: data.no_show_count || 0,
            cancellation_count: data.cancellation_count || 0,
            subscription_status: subscription?.status,
            plan_name: plan?.nome,
            plan_color: plan?.color,
          })
        }
      } catch (err) {
        console.error('Error fetching metrics:', err)
      }
    }

    fetchMetrics()
  }, [client?.id, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()
    
    const clientData = {
      barbershop_id: barbershopId,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email || null,
      phone: formData.phone || null,
      notes: formData.notes || null,
      is_vip: formData.is_vip,
    }

    if (client) {
      const { error } = await supabase
        .from("clients")
        .update(clientData)
        .eq("id", client.id)

      if (error) {
        toast.error("Failed to update client: " + error.message)
        setIsLoading(false)
        return
      }
      toast.success("Client updated successfully")
    } else {
      const { error } = await supabase
        .from("clients")
        .insert(clientData)

      if (error) {
        toast.error("Failed to add client: " + error.message)
        setIsLoading(false)
        return
      }
      toast.success("Client added successfully")
    }

    setIsLoading(false)
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{client ? "Edit Client" : "Add New Client"}</DialogTitle>
          <DialogDescription>
            {client ? "Update the client's information." : "Add a new client to your database."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {/* Metrics Section - Only show when editing existing client */}
          {client && metrics && (
            <div className="mb-6 grid grid-cols-2 gap-3">
              <Card className="p-3 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Gasto</p>
                    <p className="font-semibold text-sm">R$ {(metrics.total_spent || 0).toFixed(2)}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3 bg-green-50 border-green-200">
                <div className="flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Cortes</p>
                    <p className="font-semibold text-sm">{metrics.total_completed || 0}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3 bg-red-50 border-red-200">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Faltas</p>
                    <p className="font-semibold text-sm">{metrics.no_show_count || 0}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3 bg-purple-50 border-purple-200">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Assinatura</p>
                    {metrics.plan_name ? (
                      <Badge 
                        className="mt-1 text-xs" 
                        style={{ 
                          backgroundColor: `${metrics.plan_color}15`, 
                          color: metrics.plan_color,
                          borderColor: metrics.plan_color
                        }}
                        variant="outline"
                      >
                        {metrics.plan_name}
                      </Badge>
                    ) : (
                      <p className="text-xs text-muted-foreground">Nenhuma</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any preferences or notes about this client..."
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_vip"
                checked={formData.is_vip}
                onCheckedChange={(checked) => setFormData({ ...formData, is_vip: checked })}
                disabled={isLoading}
              />
              <Label htmlFor="is_vip">VIP Client</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {client ? "Updating..." : "Adding..."}
                </>
              ) : (
                client ? "Update Client" : "Add Client"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

