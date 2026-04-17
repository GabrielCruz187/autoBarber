'use client'

import React, { useState, useEffect } from 'react'
import { BookingStepper } from './booking-stepper'
import { StepServiceSelection } from './step-service-selection'
import { StepBarberSelection } from './step-barber-selection'
import { StepDateSelection } from './step-date-selection'
import { StepTimeSelection } from './step-time-selection'
import { StepSubscriptionSelection } from './step-subscription-selection'
import { StepClientInfo } from './step-client-info'
import { StepConfirmation } from './step-confirmation'
import { StepSuccess } from './step-success'
import { SubscriptionPlansSection } from '../subscription-plans-section'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export interface BookingState {
  serviceId: string | null
  barberId: string | null
  date: Date | null
  time: string | null
  subscriptionPlanId: string | null
  clientName: string
  clientPhone: string
  clientEmail: string
  barbershopId?: string
}

interface BookingFlowProps {
  barbershopId: string
  services: any[]
  barbers: any[]
  barbershopName: string
  subscriptionPlans?: any[]
}

export function BookingFlow({
  barbershopId,
  services,
  barbers,
  barbershopName,
  subscriptionPlans = [],
}: BookingFlowProps) {
  const [step, setStep] = useState(1)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [booking, setBooking] = useState<BookingState>({
    serviceId: null,
    barberId: null,
    date: null,
    time: null,
    subscriptionPlanId: null,
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    barbershopId: barbershopId,
  })

  // Verificar autenticação ao montar o componente
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setIsAuthenticated(true)
          setUserEmail(user.email || '')
          setUserName(user.user_metadata?.name || user.email?.split('@')[0] || '')
          setUserPhone(user.user_metadata?.phone || '')
          
          // Pre-preencher dados no booking state
          setBooking(prev => ({
            ...prev,
            clientName: user.user_metadata?.name || user.email?.split('@')[0] || '',
            clientEmail: user.email || '',
            clientPhone: user.user_metadata?.phone || '',
          }))
          
          console.log("[v0] Usuário autenticado:", user.email)
        }
      } catch (error) {
        console.error("[v0] Erro ao verificar autenticação:", error)
      } finally {
        setIsLoadingAuth(false)
      }
    }

    checkAuth()
  }, [])

  const updateBooking = (updates: Partial<BookingState>) => {
    setBooking(prev => ({ ...prev, ...updates }))
  }

  const goToStep = (newStep: number) => {
    setStep(newStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Calcular total de steps (5 se autenticado, 6 se não)
  const totalSteps = isAuthenticated ? 7 : 8

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <BookingStepper currentStep={step} totalSteps={totalSteps} />

        <div className="mt-8 animate-in fade-in-50 duration-300">
          {step === 1 && (
            <StepServiceSelection
              services={services}
              selectedService={booking.serviceId}
              onSelect={(serviceId) => {
                updateBooking({ serviceId })
                goToStep(2)
              }}
            />
          )}

          {step === 2 && (
            <StepBarberSelection
              barbers={barbers}
              selectedBarberId={booking.barberId}
              onSelect={(barberId) => {
                updateBooking({ barberId })
                goToStep(3)
              }}
              onBack={() => goToStep(1)}
            />
          )}

          {step === 3 && (
            <StepDateSelection
              selectedDate={booking.date}
              onSelect={(date) => {
                updateBooking({ date })
                goToStep(4)
              }}
              onBack={() => goToStep(2)}
            />
          )}

          {step === 4 && (
            <StepTimeSelection
              selectedTime={booking.time}
              selectedDate={booking.date}
              serviceDuration={
                services.find(s => s.id === booking.serviceId)?.duration_minutes || 30
              }
              onSelect={(time) => {
                updateBooking({ time })
                goToStep(5)
              }}
              onBack={() => goToStep(3)}
            />
          )}

          {step === 5 && (
            <StepSubscriptionSelection
              plans={subscriptionPlans}
              selectedPlan={booking.subscriptionPlanId}
              onSelect={(planId) => {
                updateBooking({ subscriptionPlanId: planId })
                // Pular para confirmação se autenticado, ou para dados do cliente
                goToStep(isAuthenticated ? 7 : 6)
              }}
              onBack={() => goToStep(4)}
            />
          )}

          {step === 6 && !isAuthenticated && (
            <StepClientInfo
              clientData={{
                name: booking.clientName,
                phone: booking.clientPhone,
                email: booking.clientEmail,
              }}
              onSubmit={(data) => {
                updateBooking({
                  clientName: data.name,
                  clientPhone: data.phone,
                  clientEmail: data.email,
                })
                goToStep(7)
              }}
              onBack={() => goToStep(5)}
            />
          )}

          {step === 7 && (
            <StepConfirmation
              booking={booking}
              services={services}
              barbers={barbers}
              isUserAuthenticated={isAuthenticated}
              onConfirm={() => goToStep(totalSteps)}
              onBack={() => goToStep(isAuthenticated ? 5 : 6)}
            />
          )}

          {step === totalSteps && (
            <StepSuccess
              barbershopName={barbershopName}
              clientName={booking.clientName}
            />
          )}
        </div>

        {/* Subscription Plans Section */}
        {subscriptionPlans.length > 0 && (
          <div className="mt-16 pt-12 border-t">
            <SubscriptionPlansSection plans={subscriptionPlans} />
          </div>
        )}
      </div>
    </div>
  )
}


