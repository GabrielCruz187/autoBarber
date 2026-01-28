'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Calendar, Zap } from 'lucide-react'
import { ServiceGrid } from '@/components/customer/service-grid'
import { AvailabilityCalendar } from '@/components/customer/availability-calendar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Barbershop, Service } from '@/lib/types'

interface PortalData {
  barbershop: Barbershop
  services: Service[]
}

export default function CustomerPortal() {
  const params = useParams()
  const barbershopId = params.id as string

  const [data, setData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<string | null>(null)

  useEffect(() => {
    fetchPortalData()
  }, [barbershopId])

  const fetchPortalData = async () => {
    try {
      const response = await fetch(`/api/customer-portal/${barbershopId}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setData(data)
    } catch (error) {
      console.error('[v0] Error fetching portal data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-20">Carregando...</div>
  }

  if (!data) {
    return <div className="text-center py-20 text-muted-foreground">Barbearia não encontrada</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{data.barbershop.name}</h1>
              {data.barbershop.address && (
                <p className="text-muted-foreground mt-2">{data.barbershop.address}</p>
              )}
            </div>
            {data.barbershop.logo_url && (
              <img
                src={data.barbershop.logo_url || "/placeholder.svg"}
                alt={data.barbershop.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="booking">Agendar</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nossos Serviços</CardTitle>
                <CardDescription>Escolha o serviço desejado e agende seu horário</CardDescription>
              </CardHeader>
              <CardContent>
                <ServiceGrid
                  services={data.services}
                  selectedId={selectedService}
                  onSelect={setSelectedService}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Próximos Passos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <Button className="flex-1" size="lg" onClick={() => scrollToBooking()}>
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Agendar via WhatsApp
                  </Button>
                  <Button variant="outline" size="lg" className="flex-1 bg-transparent">
                    <Calendar className="h-5 w-5 mr-2" />
                    Agendar Online
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="booking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Selecione uma Data e Hora</CardTitle>
                <CardDescription>
                  {selectedService
                    ? 'Encontre o melhor horário para seu agendamento'
                    : 'Primeiro selecione um serviço'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedService ? (
                  <AvailabilityCalendar
                    barbershopId={barbershopId}
                    serviceId={selectedService}
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Selecione um serviço na aba anterior
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function scrollToBooking() {
  // Scroll to booking tab or trigger WhatsApp
  // Implementation details here
}
