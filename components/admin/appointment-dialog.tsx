"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { format, addMinutes } from "date-fns"
import type { Appointment, Barber, Service, Client } from "@/lib/types"

interface AppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  barbershopId: string
  appointment?: Appointment | null
  barbers: Barber[]
  services: Service[]
  clients: Client[]
  defaultDate?: Date
}

const statusOptions = [
  { value: "pending", label: "Pendente" },
  { value: "confirmed", label: "Confirmado" },
  { value: "in_progress", label: "Em Andamento" },
  { value: "completed", label: "Concluído" },
  { value: "cancelled", label: "Cancelado" },
  { value: "no_show", label: "Não Compareceu" },
]

export function AppointmentDialog({
  open,
  onOpenChange,
  barbershopId,
  appointment,
  barbers,
  services,
  clients,
}: AppointmentDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingConflict, setIsCheckingConflict] = useState(false)
  const [conflictWarning, setConflictWarning] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    barber_id: appointment?.barber_id || "",
    client_id: appointment?.client_id || "",
    service_id: appointment?.service_id || "",
    date: appointment
      ? format(new Date(appointment.start_time), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
    time: appointment
      ? format(new Date(appointment.start_time), "HH:mm")
      : "09:00",
    status: appointment?.status || "pending",
    notes: appointment?.notes || "",
  })

  const selectedService = services.find((s) => s.id === formData.service_id)

  useEffect(() => {
    if (appointment) {
      setFormData({
        barber_id: appointment.barber_id,
        client_id: appointment.client_id,
        service_id: appointment.service_id,
        date: format(new Date(appointment.start_time), "yyyy-MM-dd"),
        time: format(new Date(appointment.start_time), "HH:mm"),
        status: appointment.status,
        notes: appointment.notes || "",
      })
    }
  }, [appointment])

  // Limpar aviso quando barbeiro/data/hora mudarem
  useEffect(() => {
    setConflictWarning(null)
  }, [formData.barber_id, formData.date, formData.time, formData.service_id])

  // ─── Verifica conflito de horário no banco ───────────────────────────────
  const checkConflict = async (): Promise<boolean> => {
    if (!formData.barber_id || !formData.date || !formData.time || !selectedService) {
      return false
    }

    setIsCheckingConflict(true)
    setConflictWarning(null)

    try {
      const supabase = createClient()
      const startTime = new Date(`${formData.date}T${formData.time}`)
      const endTime = addMinutes(startTime, selectedService.duration_minutes || 30)

      // Busca agendamentos do barbeiro no mesmo intervalo de tempo
      // Exclui o próprio agendamento em caso de edição
      let query = supabase
        .from("appointments")
        .select("id, start_time, end_time, status")
        .eq("barbershop_id", barbershopId)
        .eq("barber_id", formData.barber_id)
        .not("status", "in", '("cancelled","no_show")')
        // Sobreposição: o agendamento existente começa antes do novo terminar
        // E termina depois do novo começar
        .lt("start_time", endTime.toISOString())
        .gt("end_time", startTime.toISOString())

      // Em edição, ignora o próprio agendamento
      if (appointment?.id) {
        query = query.neq("id", appointment.id)
      }

      const { data: conflicts, error } = await query

      if (error) {
        console.error("[v0] Erro ao verificar conflito:", error)
        return false // Não bloqueia em caso de erro na verificação
      }

      if (conflicts && conflicts.length > 0) {
        const conflictStart = format(
          new Date(conflicts[0].start_time),
          "HH:mm"
        )
        const conflictEnd = format(new Date(conflicts[0].end_time), "HH:mm")
        setConflictWarning(
          `Este barbeiro já tem agendamento das ${conflictStart} às ${conflictEnd}. Escolha outro horário.`
        )
        return true
      }

      return false
    } finally {
      setIsCheckingConflict(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validações básicas
    if (!formData.barber_id) {
      toast.error("Selecione um barbeiro")
      return
    }
    if (!formData.service_id) {
      toast.error("Selecione um serviço")
      return
    }

    setIsLoading(true)

    // Verifica conflito antes de salvar
    const hasConflict = await checkConflict()
    if (hasConflict) {
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    const startTime = new Date(`${formData.date}T${formData.time}`)
    const duration = selectedService?.duration_minutes || 30
    const endTime = addMinutes(startTime, duration)

    const appointmentData = {
      barbershop_id: barbershopId,
      barber_id: formData.barber_id,
      client_id: formData.client_id || null,
      service_id: formData.service_id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_minutes: duration,
      status: formData.status,
      notes: formData.notes || null,
      total_price: selectedService?.price || 0,
    }

    if (appointment) {
      const { error } = await supabase
        .from("appointments")
        .update(appointmentData)
        .eq("id", appointment.id)

      if (error) {
        toast.error("Erro ao atualizar agendamento: " + error.message)
        setIsLoading(false)
        return
      }
      toast.success("Agendamento atualizado com sucesso")
    } else {
      const { error } = await supabase
        .from("appointments")
        .insert(appointmentData)

      if (error) {
        toast.error("Erro ao criar agendamento: " + error.message)
        setIsLoading(false)
        return
      }
      toast.success("Agendamento criado com sucesso")
    }

    setIsLoading(false)
    setConflictWarning(null)
    onOpenChange(false)
    router.refresh()
  }

  const timeSlots: string[] = []
  for (let hour = 8; hour < 21; hour++) {
    for (let min = 0; min < 60; min += 30) {
      timeSlots.push(
        `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
          <DialogDescription>
            {appointment
              ? "Atualize os detalhes do agendamento."
              : "Agende um novo horário."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">

            {/* Aviso de conflito */}
            {conflictWarning && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{conflictWarning}</AlertDescription>
              </Alert>
            )}

            {/* Cliente */}
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                value={formData.client_id}
                onValueChange={(v) => setFormData({ ...formData, client_id: v })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Barbeiro */}
            <div className="space-y-2">
              <Label>
                Barbeiro <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.barber_id}
                onValueChange={(v) =>
                  setFormData({ ...formData, barber_id: v })
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um barbeiro" />
                </SelectTrigger>
                <SelectContent>
                  {barbers
                    .filter((b) => b.is_active)
                    .map((barber) => (
                      <SelectItem key={barber.id} value={barber.id}>
                        {barber.first_name} {barber.last_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Serviço */}
            <div className="space-y-2">
              <Label>
                Serviço <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.service_id}
                onValueChange={(v) =>
                  setFormData({ ...formData, service_id: v })
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services
                    .filter((s) => s.is_active)
                    .map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} — {service.duration_minutes}min —{" "}
                        R${" "}
                        {Number(service.price).toFixed(2)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data e Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={formData.date}
                  min={format(new Date(), "yyyy-MM-dd")}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Select
                  value={formData.time}
                  onValueChange={(v) =>
                    setFormData({ ...formData, time: v })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duração estimada */}
            {selectedService && (
              <p className="text-xs text-muted-foreground">
                Término previsto:{" "}
                <strong>
                  {format(
                    addMinutes(
                      new Date(`${formData.date}T${formData.time}`),
                      selectedService.duration_minutes || 30
                    ),
                    "HH:mm"
                  )}
                </strong>{" "}
                ({selectedService.duration_minutes} min)
              </p>
            )}

            {/* Status (só em edição) */}
            {appointment && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) =>
                    setFormData({ ...formData, status: v })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Observações */}
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                placeholder="Alguma observação sobre o agendamento..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                disabled={isLoading}
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isCheckingConflict || !!conflictWarning}
            >
              {isLoading || isCheckingConflict ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCheckingConflict ? "Verificando..." : "Salvando..."}
                </>
              ) : appointment ? (
                "Atualizar"
              ) : (
                "Agendar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}