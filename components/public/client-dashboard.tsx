'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Calendar, Clock, Plus, History, Gift, User, Scissors, ChevronRight, Loader2 } from 'lucide-react'
import { BookingFlow } from './booking/booking-flow'

interface ClientDashboardProps {
  barbershopId: string
  barbershopName: string
  clientName?: string
  services: any[]
  barbers: any[]
  subscriptionPlans?: any[]
  upcomingAppointments?: any[]
  recentAppointments?: any[]
}

export function ClientDashboard({
  barbershopId,
  barbershopName,
  clientName = "Cliente",
  services,
  barbers,
  subscriptionPlans = [],
  upcomingAppointments = [],
  recentAppointments = [],
}: ClientDashboardProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard')

  // Transformar dados dos agendamentos
  const transformedUpcoming = upcomingAppointments.map((apt: any) => ({
    id: apt.id,
    service_name: apt.service?.name || "Serviço",
    barber_name: apt.barber ? `${apt.barber.first_name} ${apt.barber.last_name}` : "Barbeiro",
    date: apt.start_time,
    time: new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    price: apt.total_price || 0,
    duration: apt.service?.duration_minutes || 30,
  }))

  const transformedRecent = recentAppointments.map((apt: any) => ({
    id: apt.id,
    service_name: apt.service?.name || "Serviço",
    barber_name: apt.barber ? `${apt.barber.first_name} ${apt.barber.last_name}` : "Barbeiro",
    date: apt.start_time,
    time: new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    price: apt.total_price || 0,
    duration: apt.service?.duration_minutes || 30,
  }))

  const nextAppointment = transformedUpcoming?.[0]
  const hasUpcomingAppointments = transformedUpcoming && transformedUpcoming.length > 0

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    return `${hours}:${minutes}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header com Saudação */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500">Bem-vindo de volta</p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{barbershopName}</h1>
          </div>
          <Avatar className="h-12 w-12 ring-2 ring-primary/10">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Client" />
            <AvatarFallback>CL</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Card de Próximo Corte - Premium */}
        {hasUpcomingAppointments ? (
          <div className="group cursor-pointer">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-primary/95 to-primary/80 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
              <CardContent className="relative pt-6 pb-8 text-white space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-white/80">Próximo Agendamento</p>
                    <p className="text-xs text-white/60 mt-1">Em breve</p>
                  </div>
                  <Scissors className="h-5 w-5 text-white/60" />
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-4xl font-bold">{formatDate(nextAppointment.date)}</p>
                    <p className="text-lg font-semibold text-white/90 mt-1">{formatTime(nextAppointment.time)}</p>
                  </div>

                  <div className="pt-3 border-t border-white/20">
                    <p className="text-sm font-medium text-white/80 mb-3">Com {nextAppointment.barber_name}</p>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-white/20">
                        <AvatarImage src={nextAppointment.barber_avatar} />
                        <AvatarFallback>{nextAppointment.barber_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{nextAppointment.service_name}</p>
                        <p className="text-xs text-white/70">{nextAppointment.duration} min</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  size="sm"
                  variant="secondary"
                  className="w-full font-semibold"
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-100 to-slate-50 border-2 border-dashed border-slate-300">
            <CardContent className="pt-12 pb-12 text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Nenhum agendamento</h3>
                <p className="text-sm text-slate-600">Você não tem cortes agendados. Reserve um agora!</p>
              </div>
              <Button 
                onClick={() => setIsBookingOpen(true)}
                className="w-full h-11 rounded-full font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agendar Corte
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Ações Rápidas - Grid Horizontal */}
        <div className="grid grid-cols-4 gap-3">
          <QuickActionButton
            icon={Plus}
            label="Novo"
            onClick={() => setIsBookingOpen(true)}
          />
          <QuickActionButton
            icon={History}
            label="Histórico"
            onClick={() => setActiveTab('history')}
          />
          <QuickActionButton
            icon={Gift}
            label="Assinatura"
            onClick={() => {}}
          />
          <QuickActionButton
            icon={User}
            label="Perfil"
            onClick={() => {}}
          />
        </div>

        {/* Histórico Recente */}
        {transformedRecent && transformedRecent.length > 0 && (
          <div className="space-y-3">
            <div className="px-1">
              <h3 className="text-sm font-semibold text-slate-900">Histórico Recente</h3>
            </div>
            <div className="space-y-2">
              {transformedRecent.slice(0, 3).map((apt) => (
                <Card key={apt.id} className="border-0 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900">{apt.service_name}</p>
                      <p className="text-xs text-slate-600 mt-1">{formatDate(apt.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-primary">R$ {apt.price.toFixed(2)}</p>
                      <ChevronRight className="h-4 w-4 text-slate-400 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sheet de Booking */}
      <Sheet open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0 border-0">
          <div className="h-full overflow-y-auto">
            <BookingFlow
              barbershopId={barbershopId}
              services={services}
              barbers={barbers}
              barbershopName={barbershopName}
              subscriptionPlans={subscriptionPlans}
              onBookingComplete={() => setIsBookingOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function QuickActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<any>
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
    >
      <div className="p-2.5 rounded-full bg-slate-100 group-hover:bg-primary/10 transition-colors">
        <Icon className="h-5 w-5 text-slate-700 group-hover:text-primary transition-colors" />
      </div>
      <span className="text-xs font-medium text-slate-700 text-center">{label}</span>
    </button>
  )
}

