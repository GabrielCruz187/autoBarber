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
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 border-2 ${
                  index + 1 < currentStep
                    ? 'bg-green-500 border-green-500 text-white'
                    : index + 1 === currentStep
                    ? 'bg-primary border-primary text-primary-foreground ring-2 ring-primary ring-offset-2 scale-110'
                    : 'bg-muted border-muted text-muted-foreground'
                }`}
              >
                {index + 1 < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={`text-xs mt-2 text-center transition-colors duration-300 font-semibold max-w-12 ${
                index + 1 <= currentStep
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1.5 rounded-full transition-all duration-300 ${
                index + 1 < currentStep ? 'bg-green-500' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
