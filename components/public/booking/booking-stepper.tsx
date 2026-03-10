'use client'

import { Check } from 'lucide-react'

interface BookingStepperProps {
  currentStep: number
  totalSteps: number
}

export function BookingStepper({
  currentStep,
  totalSteps,
}: BookingStepperProps) {
  const steps = [
    'Serviço',
    'Profissional',
    'Data',
    'Horário',
    'Dados',
    'Resumo',
    'Confirmado',
  ]

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                  index + 1 < currentStep
                    ? 'bg-green-500 text-white'
                    : index + 1 === currentStep
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1 < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={`text-xs mt-2 text-center transition-colors duration-300 ${
                index + 1 <= currentStep
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground'
              }`}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`h-1 flex-1 mx-1 rounded-full transition-all duration-300 ${
                index + 1 < currentStep ? 'bg-green-500' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
