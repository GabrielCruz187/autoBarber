"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Client } from "@/lib/types"

interface ClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  barbershopId: string
  client?: Client | null
}

export function ClientDialog({ open, onOpenChange, barbershopId, client }: ClientDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: client?.first_name || "",
    last_name: client?.last_name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    notes: client?.notes || "",
    is_vip: client?.is_vip || false,
  })

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
