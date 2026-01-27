export interface Barbershop {
  id: string
  name: string
  slug: string
  owner_id: string
  description: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  country: string | null
  phone: string | null
  email: string | null
  website: string | null
  logo_url: string | null
  cover_image_url: string | null
  timezone: string
  currency: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
  role: 'super_admin' | 'owner' | 'manager' | 'barber' | 'client'
  created_at: string
  updated_at: string
}

export interface Barber {
  id: string
  barbershop_id: string
  user_id: string | null
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  avatar_url: string | null
  bio: string | null
  specialties: string[] | null
  is_active: boolean
  commission_rate: number | null
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface Service {
  id: string
  barbershop_id: string
  name: string
  description: string | null
  duration_minutes: number
  price: number
  category: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  barbershop_id: string
  user_id: string | null
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  avatar_url: string | null
  notes: string | null
  is_vip: boolean
  total_visits: number
  total_spent: number
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  barbershop_id: string
  barber_id: string
  client_id: string
  service_id: string
  start_time: string
  end_time: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  notes: string | null
  total_price: number
  created_at: string
  updated_at: string
  barber?: Barber
  client?: Client
  service?: Service
}

export interface WorkingHours {
  id: string
  barbershop_id: string
  barber_id: string | null
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
}

export interface DashboardStats {
  todayAppointments: number
  weekRevenue: number
  totalClients: number
  activeBarbers: number
  recentAppointments: Appointment[]
  upcomingAppointments: Appointment[]
}
