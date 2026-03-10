'use client'

import React, { useState } from 'react'
import { BookingStepper } from './booking-stepper'
import { StepServiceSelection } from './step-service-selection'
import { StepBarberSelection } from './step-barber-selection'
import { StepDateSelection } from './step-date-selection'
import { StepTimeSelection } from './step-time-selection'
import { StepClientInfo } from './step-client-info'
import { StepConfirmation } from './step-confirmation'
import { StepSuccess } from './step-success'

export interface BookingState {
  serviceId: string | null
  barberId: string | null
  date: Date | null
  time: string | null
  clientName: string
  clientPhone: string
  clientEmail: string
}

interface BookingFlowProps {
  barbershopId: string
  services: any[]
  barbers: any[]
  barbershopName: string
}

export function BookingFlow({
  barbershopId,
  services,
  barbers,
  barbershopName,
}: BookingFlowProps) {
  const [step, setStep] = useState(1)
  const [booking, setBooking] = useState<BookingState>({
    serviceId: null,
    barberId: null,
    date: null,
    time: null,
    clientName: '',
    clientPhone: '',
    clientEmail: '',
  })

  const updateBooking = (updates: Partial<BookingState>) => {
    setBooking(prev => ({ ...prev, ...updates }))
  }

  const goToStep = (newStep: number) => {
    setStep(newStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <BookingStepper currentStep={step} totalSteps={7} />

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
                goToStep(6)
              }}
              onBack={() => goToStep(4)}
            />
          )}

          {step === 6 && (
            <StepConfirmation
              booking={booking}
              services={services}
              barbers={barbers}
              onConfirm={() => goToStep(7)}
              onBack={() => goToStep(5)}
            />
          )}

          {step === 7 && (
            <StepSuccess
              barbershopName={barbershopName}
              clientName={booking.clientName}
            />
          )}
        </div>
      </div>
    </div>
  )
}
