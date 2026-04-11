'use client'

import React, { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TrendingUp } from 'lucide-react'

interface HeatmapData {
  dayOfWeek: number // 0 = Monday, 6 = Sunday
  hour: number
  occupancyPercentage: number
  appointmentCount: number
  capacity: number
}

interface PeakHoursHeatmapProps {
  data: HeatmapData[]
  loading?: boolean
  onFilterChange?: (period: string, barber?: string) => void
}

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const HOURS = Array.from({ length: 10 }, (_, i) => `${i + 9}:00`)

const getOccupancyColor = (percentage: number): string => {
  if (percentage === 0) return 'bg-gray-100'
  if (percentage < 25) return 'bg-green-200 hover:bg-green-300'
  if (percentage < 50) return 'bg-yellow-200 hover:bg-yellow-300'
  if (percentage < 75) return 'bg-orange-300 hover:bg-orange-400'
  return 'bg-red-500 hover:bg-red-600'
}

const getOccupancyLabel = (percentage: number): string => {
  if (percentage === 0) return 'Vazio'
  if (percentage < 25) return 'Baixa'
  if (percentage < 50) return 'Média'
  if (percentage < 75) return 'Alta'
  return 'Lotado'
}

export function PeakHoursHeatmap({ data, loading = false, onFilterChange }: PeakHoursHeatmapProps) {
  const [period, setPeriod] = useState('7')
  const [selectedBarber, setSelectedBarber] = useState('all')

  const matrix = useMemo(() => {
    const mat: Record<string, Record<string, HeatmapData | null>> = {}

    // Initialize matrix
    DAYS.forEach(day => {
      mat[day] = {}
      HOURS.forEach(hour => {
        mat[day][hour] = null
      })
    })

    // Fill with data
    data.forEach(item => {
      const day = DAYS[item.dayOfWeek] || DAYS[0]
      const hour = HOURS[item.hour - 9] || HOURS[0]
      if (mat[day] && mat[day][hour] !== undefined) {
        mat[day][hour] = item
      }
    })

    return mat
  }, [data])

  const stats = useMemo(() => {
    let maxOccupancy = 0
    let minOccupancy = 100
    let peakHour = ''
    let lowHour = ''

    Object.entries(matrix).forEach(([day, hours]) => {
      Object.entries(hours).forEach(([hour, item]) => {
        if (item && item.occupancyPercentage > 0) {
          if (item.occupancyPercentage > maxOccupancy) {
            maxOccupancy = item.occupancyPercentage
            peakHour = `${day} às ${hour}`
          }
          if (item.occupancyPercentage < minOccupancy) {
            minOccupancy = item.occupancyPercentage
            lowHour = `${day} às ${hour}`
          }
        }
      })
    })

    return { maxOccupancy, peakHour, lowHour }
  }, [matrix])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Horários de Pico</h3>
          <p className="text-sm text-muted-foreground">Visualize a ocupação por horário e dia</p>
        </div>

        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 p-3 rounded-lg bg-muted/50">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
          <span>Vazio</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 bg-green-200 rounded"></div>
          <span>0-25%</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 bg-yellow-200 rounded"></div>
          <span>25-50%</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 bg-orange-300 rounded"></div>
          <span>50-75%</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>75-100%</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <Card className="p-4 overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid gap-px" style={{ gridTemplateColumns: `60px repeat(${DAYS.length}, 80px)` }}>
            {/* Header */}
            <div></div>
            {DAYS.map(day => (
              <div key={day} className="h-12 flex items-center justify-center font-semibold text-xs text-center">
                {day}
              </div>
            ))}

            {/* Heatmap cells */}
            {HOURS.map(hour => (
              <React.Fragment key={hour}>
                <div className="h-12 flex items-center justify-center font-semibold text-xs text-muted-foreground border-r border-border">
                  {hour}
                </div>
                {DAYS.map(day => {
                  const cellData = matrix[day]?.[hour]
                  const occupancy = cellData?.occupancyPercentage || 0

                  return (
                    <TooltipProvider key={`${day}-${hour}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`h-12 rounded cursor-pointer transition-all ${getOccupancyColor(occupancy)} flex items-center justify-center text-xs font-semibold`}
                          >
                            {occupancy > 0 && `${Math.round(occupancy)}%`}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs space-y-1">
                            <p className="font-semibold">{day} às {hour}</p>
                            <p>{cellData?.appointmentCount || 0} atendimentos</p>
                            <p>Capacidade: {cellData?.capacity || 0}</p>
                            <p>Ocupação: {Math.round(occupancy)}%</p>
                            <p className="text-muted-foreground">{getOccupancyLabel(occupancy)}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Card>

      {/* Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-red-500 mt-1" />
            <div>
              <p className="text-sm font-semibold">Melhor horário</p>
              <p className="text-xs text-muted-foreground">{stats.peakHour}</p>
              <p className="text-sm font-bold text-red-500 mt-1">{Math.round(stats.maxOccupancy)}% de ocupação</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-green-500 mt-1" />
            <div>
              <p className="text-sm font-semibold">Pior horário</p>
              <p className="text-xs text-muted-foreground">{stats.lowHour}</p>
              <p className="text-sm font-bold text-green-500 mt-1">Oportunidade de promoção</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
