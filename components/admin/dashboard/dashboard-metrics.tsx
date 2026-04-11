'use client'

import { useEffect, useState } from 'react'
import { PeakHoursHeatmap } from './peak-hours-heatmap'
import { RevenueMetrics } from './revenue-metrics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface DashboardMetricsProps {
  barbershopId: string
}

interface HeatmapData {
  dayOfWeek: number
  hour: number
  occupancyPercentage: number
  appointmentCount: number
  capacity: number
}

interface RevenueData {
  dailyRevenue: Array<{ date: string; revenue: number }>
  monthlyRevenue: Array<{ month: string; revenue: number }>
  topServices: Array<{ name: string; count: number; revenue: number }>
}

export function DashboardMetrics({ barbershopId }: DashboardMetricsProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const [heatmapRes, revenueRes] = await Promise.all([
          fetch(`/api/admin/peak-hours?barbershopId=${barbershopId}&period=7`),
          fetch(`/api/admin/revenue-metrics?barbershopId=${barbershopId}&period=30`),
        ])

        if (heatmapRes.ok) {
          const data = await heatmapRes.json()
          setHeatmapData(data)
        }

        if (revenueRes.ok) {
          const data = await revenueRes.json()
          setRevenueData(data)
        }
      } catch (error) {
        console.error('[v0] Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [barbershopId])

  if (loading) {
    return <div className="h-96 bg-muted animate-pulse rounded-lg" />
  }

  return (
    <Tabs defaultValue="peak-hours" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="peak-hours">Horários de Pico</TabsTrigger>
        <TabsTrigger value="revenue">Faturamento</TabsTrigger>
      </TabsList>

      <TabsContent value="peak-hours" className="space-y-4">
        <PeakHoursHeatmap data={heatmapData} loading={loading} />
      </TabsContent>

      <TabsContent value="revenue" className="space-y-4">
        {revenueData && (
          <RevenueMetrics
            dailyRevenue={revenueData.dailyRevenue}
            monthlyRevenue={revenueData.monthlyRevenue}
            topServices={revenueData.topServices}
          />
        )}
      </TabsContent>
    </Tabs>
  )
}
