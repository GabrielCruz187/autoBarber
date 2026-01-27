// Mock data service - Replace with actual database calls
// In production, use Supabase client to fetch real data

import type { Service, Barber, Client, Appointment } from '@/lib/types'

// Mock data for development
const mockServices: Service[] = [
  {
    id: 'service-1',
    barbershop_id: 'default-barbershop',
    name: 'Corte Masculino',
    description: 'Corte tradicional masculino',
    duration_minutes: 30,
    price: 45.0,
    category: 'corte',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'service-2',
    barbershop_id: 'default-barbershop',
    name: 'Barba',
    description: 'Aparar e modelar barba',
    duration_minutes: 20,
    price: 30.0,
    category: 'barba',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'service-3',
    barbershop_id: 'default-barbershop',
    name: 'Corte + Barba',
    description: 'Combo corte e barba',
    duration_minutes: 45,
    price: 65.0,
    category: 'combo',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockBarbers: Barber[] = [
  {
    id: 'barber-1',
    barbershop_id: 'default-barbershop',
    user_id: null,
    first_name: 'Carlos',
    last_name: 'Silva',
    email: 'carlos@barbershop.com',
    phone: '11999999999',
    avatar_url: null,
    bio: 'Especialista em cortes modernos',
    specialties: ['cortes modernos', 'degradê'],
    is_active: true,
    commission_rate: 50,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'barber-2',
    barbershop_id: 'default-barbershop',
    user_id: null,
    first_name: 'Joao',
    last_name: 'Santos',
    email: 'joao@barbershop.com',
    phone: '11988888888',
    avatar_url: null,
    bio: 'Especialista em barbas',
    specialties: ['barbas', 'cortes clássicos'],
    is_active: true,
    commission_rate: 50,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockClients: Client[] = []
const mockAppointments: Appointment[] = []

// Service functions
export async function getServices(barbershopId: string): Promise<Service[]> {
  // In production: fetch from Supabase
  return mockServices.filter((s) => s.barbershop_id === barbershopId && s.is_active)
}

export async function getBarbers(barbershopId: string): Promise<(Barber & { name: string })[]> {
  // In production: fetch from Supabase
  return mockBarbers
    .filter((b) => b.barbershop_id === barbershopId && b.is_active)
    .map((b) => ({ ...b, name: `${b.first_name} ${b.last_name}` }))
}

export async function getAvailableSlots(
  _barbershopId: string,
  date: string,
  barberId?: string,
  _serviceId?: string
): Promise<string[]> {
  // In production: Check working_hours and existing appointments
  // For now, return mock available slots

  const slots: string[] = []
  const today = new Date()
  const selectedDate = new Date(date)

  // Start time (9:00) and end time (18:00)
  let startHour = 9
  const endHour = 18

  // If it's today, start from current hour + 1
  if (selectedDate.toDateString() === today.toDateString()) {
    startHour = Math.max(today.getHours() + 1, 9)
  }

  // Generate 30-minute slots
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    slots.push(`${hour.toString().padStart(2, '0')}:30`)
  }

  // Filter out booked slots (in production, check database)
  const bookedSlots = mockAppointments
    .filter((a) => {
      const appointmentDate = a.start_time.split('T')[0]
      return appointmentDate === date && (!barberId || a.barber_id === barberId)
    })
    .map((a) => {
      const time = a.start_time.split('T')[1]
      return time.substring(0, 5)
    })

  return slots.filter((slot) => !bookedSlots.includes(slot))
}

export async function getClientByPhone(
  barbershopId: string,
  phone: string
): Promise<Client | null> {
  // In production: fetch from Supabase
  return mockClients.find((c) => c.barbershop_id === barbershopId && c.phone === phone) || null
}

export async function createClient(
  barbershopId: string,
  phone: string,
  name: string = 'Cliente WhatsApp'
): Promise<Client> {
  // In production: insert into Supabase
  const nameParts = name.split(' ')
  const newClient: Client = {
    id: `client-${Date.now()}`,
    barbershop_id: barbershopId,
    user_id: null,
    first_name: nameParts[0] || 'Cliente',
    last_name: nameParts.slice(1).join(' ') || 'WhatsApp',
    email: null,
    phone,
    avatar_url: null,
    notes: 'Cadastrado via WhatsApp',
    is_vip: false,
    total_visits: 0,
    total_spent: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  mockClients.push(newClient)
  return newClient
}

export interface CreateAppointmentParams {
  barbershop_id: string
  barber_id?: string
  client_id: string
  service_id: string
  scheduled_date: string
  scheduled_time: string
  client_phone: string
}

export async function createAppointment(
  params: CreateAppointmentParams
): Promise<Appointment | null> {
  // In production: insert into Supabase
  const service = mockServices.find((s) => s.id === params.service_id)
  if (!service) return null

  // If no barber selected, pick the first available one
  let barberId = params.barber_id
  if (!barberId) {
    const availableBarber = mockBarbers.find((b) => b.is_active)
    barberId = availableBarber?.id
  }
  if (!barberId) return null

  const startTime = `${params.scheduled_date}T${params.scheduled_time}:00`
  const endDate = new Date(startTime)
  endDate.setMinutes(endDate.getMinutes() + service.duration_minutes)
  const endTime = endDate.toISOString()

  const newAppointment: Appointment = {
    id: `apt-${Date.now()}`,
    barbershop_id: params.barbershop_id,
    barber_id: barberId,
    client_id: params.client_id,
    service_id: params.service_id,
    start_time: startTime,
    end_time: endTime,
    status: 'confirmed',
    notes: `Agendado via WhatsApp - Tel: ${params.client_phone}`,
    total_price: service.price,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  mockAppointments.push(newAppointment)
  return newAppointment
}

// Financial report functions
export interface DailyReport {
  date: string
  total_revenue: number
  total_appointments: number
  completed_appointments: number
  cancelled_appointments: number
  services_breakdown: { service_name: string; count: number; revenue: number }[]
}

export interface BarberReport {
  barber_id: string
  barber_name: string
  total_revenue: number
  commission: number
  total_appointments: number
}

export async function getDailyRevenue(
  _barbershopId: string,
  date: string,
  barberId?: string
): Promise<DailyReport> {
  // In production: aggregate from Supabase
  const dayAppointments = mockAppointments.filter((a) => {
    const appointmentDate = a.start_time.split('T')[0]
    const matchesDate = appointmentDate === date
    const matchesBarber = !barberId || a.barber_id === barberId
    return matchesDate && matchesBarber
  })

  const completedAppointments = dayAppointments.filter((a) => a.status === 'completed')
  const cancelledAppointments = dayAppointments.filter((a) => a.status === 'cancelled')

  const totalRevenue = completedAppointments.reduce((sum, a) => sum + a.total_price, 0)

  return {
    date,
    total_revenue: totalRevenue,
    total_appointments: dayAppointments.length,
    completed_appointments: completedAppointments.length,
    cancelled_appointments: cancelledAppointments.length,
    services_breakdown: [],
  }
}

export async function getWeeklyCommission(
  _barbershopId: string,
  barberId: string
): Promise<{ total_revenue: number; commission: number; appointments: number }> {
  // In production: aggregate from Supabase
  const today = new Date()
  const weekAgo = new Date(today)
  weekAgo.setDate(today.getDate() - 7)

  const barberAppointments = mockAppointments.filter((a) => {
    const appointmentDate = new Date(a.start_time)
    return (
      a.barber_id === barberId &&
      a.status === 'completed' &&
      appointmentDate >= weekAgo &&
      appointmentDate <= today
    )
  })

  const totalRevenue = barberAppointments.reduce((sum, a) => sum + a.total_price, 0)
  const barber = mockBarbers.find((b) => b.id === barberId)
  const commissionRate = barber?.commission_rate || 50

  return {
    total_revenue: totalRevenue,
    commission: (totalRevenue * commissionRate) / 100,
    appointments: barberAppointments.length,
  }
}

export async function getBarberRevenue(
  _barbershopId: string,
  barberId: string,
  startDate: string,
  endDate: string
): Promise<BarberReport> {
  // In production: aggregate from Supabase
  const barber = mockBarbers.find((b) => b.id === barberId)
  if (!barber) {
    return {
      barber_id: barberId,
      barber_name: 'Desconhecido',
      total_revenue: 0,
      commission: 0,
      total_appointments: 0,
    }
  }

  const barberAppointments = mockAppointments.filter((a) => {
    const appointmentDate = a.start_time.split('T')[0]
    return (
      a.barber_id === barberId &&
      a.status === 'completed' &&
      appointmentDate >= startDate &&
      appointmentDate <= endDate
    )
  })

  const totalRevenue = barberAppointments.reduce((sum, a) => sum + a.total_price, 0)
  const commissionRate = barber.commission_rate || 50

  return {
    barber_id: barberId,
    barber_name: `${barber.first_name} ${barber.last_name}`,
    total_revenue: totalRevenue,
    commission: (totalRevenue * commissionRate) / 100,
    total_appointments: barberAppointments.length,
  }
}

export async function getBarberByPhone(
  barbershopId: string,
  phone: string
): Promise<(Barber & { name: string }) | null> {
  // In production: fetch from Supabase
  const barber = mockBarbers.find((b) => b.barbershop_id === barbershopId && b.phone === phone)
  if (!barber) return null
  return { ...barber, name: `${barber.first_name} ${barber.last_name}` }
}

export async function getBarberByName(
  barbershopId: string,
  name: string
): Promise<(Barber & { name: string }) | null> {
  // In production: fetch from Supabase with fuzzy search
  const normalizedName = name.toLowerCase()
  const barber = mockBarbers.find((b) => {
    const fullName = `${b.first_name} ${b.last_name}`.toLowerCase()
    return b.barbershop_id === barbershopId && fullName.includes(normalizedName)
  })
  if (!barber) return null
  return { ...barber, name: `${barber.first_name} ${barber.last_name}` }
}
