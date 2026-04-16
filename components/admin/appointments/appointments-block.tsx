'use client'

import React from 'react'
import { format } from 'date-fns'
import type { Appointment } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

interface AppointmentBlockProps {
  appointment: Appointment & {
    client?: {
      first_name: string
      subscription?: {
        plan?: {
          color?: string
        }
      }
    }
  }
}

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-800' },
  in_progress: { bg: 'bg-purple-100', text: 'text-purple-800' },
  completed: { bg: 'bg-green-100', text: 'text-green-800' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
  no_show: { bg: 'bg-gray-100', text: 'text-gray-800' },
}

export function AppointmentBlock({ appointment }: AppointmentBlockProps) {
  const startTime = new Date(appointment.start_time)
  const timeStr = format(startTime, 'HH:mm')
  const colors = statusColors[appointment.status] || statusColors.pending
  
  // Check if customer has an active subscription with a plan color
  const planColor = appointment.client?.subscription?.plan?.color
  const hasPlanColor = planColor && appointment.status === 'confirmed'

  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number = 0.15) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const blockStyle = hasPlanColor
    ? {
        backgroundColor: hexToRgba(planColor, 0.15),
        borderLeftColor: planColor,
      }
    : undefined

  const borderClass = hasPlanColor ? 'border-l-4' : 'border-l-2'

  return (
    <div
      className={`${colors.bg} rounded-md p-2 h-full flex flex-col justify-start gap-1 shadow-sm ${borderClass} border-blue-500 hover:shadow-md transition-shadow`}
      style={blockStyle}
    >
      <div className="space-y-1">
        <p className="text-xs font-bold truncate">{appointment.client?.first_name || 'Cliente'}</p>
        <p className="text-xs text-muted-foreground truncate">{timeStr}</p>
        {appointment.service && (
          <p className="text-xs truncate">{appointment.service.name}</p>
        )}
      </div>
      <Badge className="w-fit text-xs py-0" variant="outline">
        {appointment.status}
      </Badge>
    </div>
  )
}

