'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User, Phone, Mail, Star, X, Check } from 'lucide-react'
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

interface SubscriptionPlan {
  id: string
  nome: string
  descricao: string | null
  preco: number
  servicos_inclusos: number | null
  beneficios: string[] | null
}

function PainelClienteContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
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
      setSubscriptionPlans(data.subscriptionPlans || [])
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
          <h1 className="text-3xl font-bold">Meu Painel</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seus agendamentos e conheça nossos planos
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

        {/* Tabs for Appointments and Subscription Plans */}
        <Tabs defaultValue="appointments" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="appointments">
              Agendamentos ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="plans">Planos de Assinatura</TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
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
          </TabsContent>

          {/* Subscription Plans Tab */}
          <TabsContent value="plans" className="space-y-4">
            {subscriptionPlans.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p>Nenhum plano disponível no momento</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptionPlans.map((plan) => (
                  <Card key={plan.id} className="flex flex-col hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>{plan.nome}</CardTitle>
                      {plan.descricao && (
                        <CardDescription>{plan.descricao}</CardDescription>
                      )}
                      <div className="pt-4">
                        <div className="text-3xl font-bold">
                          R$ {(plan.preco).toFixed(2)}
                        </div>
                        <p className="text-sm text-muted-foreground">por mês</p>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col gap-6">
                      {plan.servicos_inclusos && (
                        <Badge variant="secondary">
                          {plan.servicos_inclusos} serviços inclusos
                        </Badge>
                      )}

                      {plan.beneficios && plan.beneficios.length > 0 && (
                        <ul className="space-y-2 text-sm">
                          {plan.beneficios.map((beneficio, idx) => (
                            <li key={idx} className="flex gap-2">
                              <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-1" />
                              <span>{beneficio}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <Button className="w-full mt-auto">
                        Assinar Plano
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function PainelClientePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4">
            <div className="h-8 w-8 rounded-full border-4 border-muted border-t-primary animate-spin" />
            <p className="text-muted-foreground">Carregando painel...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <PainelClienteContent />
    </Suspense>
  )
}

