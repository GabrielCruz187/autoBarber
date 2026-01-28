'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User, Phone, Mail, Star, X } from 'lucide-react'
import { toast } from 'sonner'

interface Appointment {
  id: string
  start_time: string
  end_time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  service: {
    name: string
    duration_minutes: number
    price: string
  }
  barber: {
    first_name: string
    last_name: string
  }
}

interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
}

export default function CustomerDashboard() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [ratingId, setRatingId] = useState<string | null>(null)
  const [rating, setRating] = useState(0)

  useEffect(() => {
    if (!token) {
      toast.error('Token inválido')
      return
    }
    fetchCustomerData()
  }, [token])

  const fetchCustomerData = async () => {
    try {
      const response = await fetch(`/api/customer/dashboard?token=${token}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setCustomer(data.customer)
      setAppointments(data.appointments)
    } catch (error) {
      console.error('[v0] Error fetching customer data:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    setCancellingId(appointmentId)
    try {
      const response = await fetch(`/api/customer/appointments/${appointmentId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      if (!response.ok) throw new Error('Failed to cancel')
      toast.success('Agendamento cancelado')
      setAppointments((prev) => prev.filter((a) => a.id !== appointmentId))
    } catch (error) {
      toast.error('Erro ao cancelar agendamento')
      console.error('[v0] Cancel error:', error)
    } finally {
      setCancellingId(null)
    }
  }

  const handleRateAppointment = async (appointmentId: string) => {
    if (rating === 0) {
      toast.error('Selecione uma avaliação')
      return
    }
    try {
      const response = await fetch(`/api/customer/appointments/${appointmentId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rating }),
      })
      if (!response.ok) throw new Error('Failed to rate')
      toast.success('Obrigado pela avaliação!')
      setRatingId(null)
      setRating(0)
      fetchCustomerData()
    } catch (error) {
      toast.error('Erro ao enviar avaliação')
      console.error('[v0] Rating error:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-20">Carregando...</div>
  }

  if (!customer) {
    return <div className="text-center py-20 text-muted-foreground">Cliente não encontrado</div>
  }

  const upcomingAppointments = appointments.filter(
    (a) => new Date(a.start_time) > new Date() && a.status !== 'cancelled'
  )
  const pastAppointments = appointments.filter(
    (a) => new Date(a.start_time) <= new Date() || a.status === 'cancelled'
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">Meus Agendamentos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seus compromissos na barbearia
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Customer Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">
                    {customer.first_name} {customer.last_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{customer.phone_number}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Tabs */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">
              Próximos ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum agendamento próximo</p>
                </CardContent>
              </Card>
            ) : (
              upcomingAppointments.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  onCancel={() => handleCancelAppointment(apt.id)}
                  isCancelling={cancellingId === apt.id}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {pastAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum agendamento anterior</p>
                </CardContent>
              </Card>
            ) : (
              pastAppointments.map((apt) => (
                <Card key={apt.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{apt.service.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            com {apt.barber.first_name} {apt.barber.last_name}
                          </p>
                        </div>
                        <Badge
                          variant={apt.status === 'completed' ? 'default' : 'secondary'}
                        >
                          {apt.status === 'completed' ? 'Concluído' : 'Cancelado'}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(apt.start_time).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {new Date(apt.start_time).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div className="flex items-center gap-2">
                          R$ {apt.service.price}
                        </div>
                      </div>

                      {apt.status === 'completed' && ratingId !== apt.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRatingId(apt.id)}
                          className="w-full"
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Avaliar
                        </Button>
                      )}

                      {ratingId === apt.id && (
                        <div className="space-y-3 pt-3 border-t">
                          <div className="flex gap-1 justify-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setRating(star)}
                                className="text-2xl transition-transform hover:scale-110"
                              >
                                {star <= rating ? '⭐' : '☆'}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleRateAppointment(apt.id)}
                              className="flex-1"
                            >
                              Enviar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setRatingId(null)
                                setRating(0)
                              }}
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function AppointmentCard({
  appointment,
  onCancel,
  isCancelling,
}: {
  appointment: Appointment
  onCancel: () => void
  isCancelling: boolean
}) {
  const canCancel = new Date(appointment.start_time).getTime() - Date.now() > 24 * 60 * 60 * 1000

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{appointment.service.name}</h3>
              <p className="text-sm text-muted-foreground">
                com {appointment.barber.first_name} {appointment.barber.last_name}
              </p>
            </div>
            <Badge>{appointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}</Badge>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {new Date(appointment.start_time).toLocaleDateString('pt-BR')}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {new Date(appointment.start_time).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              - {new Date(appointment.end_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="flex items-center gap-2">
              R$ {appointment.service.price}
            </div>
          </div>

          {canCancel && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onCancel}
              disabled={isCancelling}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              {isCancelling ? 'Cancelando...' : 'Cancelar Agendamento'}
            </Button>
          )}
          {!canCancel && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Cancelamentos devem ser realizados com até 24h de antecedência
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
