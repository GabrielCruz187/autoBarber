-- BarberPro SaaS Database Schema
-- Multi-tenant barbershop management system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- BARBERSHOPS (Tenants)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.barbershops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  primary_color TEXT DEFAULT '#0ea5e9',
  secondary_color TEXT DEFAULT '#f97316',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USER PROFILES (linked to auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE SET NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('super_admin', 'owner', 'manager', 'barber', 'client')) DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BARBERS (staff members)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.barbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 50.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SERVICES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CLIENTS (customers of barbershops)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  total_visits INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- APPOINTMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  client_name TEXT,
  client_phone TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- WORKING HOURS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - PROFILES
-- =====================================================
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to view profiles in their barbershop
CREATE POLICY "profiles_select_same_barbershop" ON public.profiles
  FOR SELECT USING (
    barbershop_id IN (
      SELECT barbershop_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- =====================================================
-- RLS POLICIES - BARBERSHOPS
-- =====================================================
CREATE POLICY "barbershops_select_own" ON public.barbershops
  FOR SELECT USING (
    id IN (SELECT barbershop_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "barbershops_update_own" ON public.barbershops
  FOR UPDATE USING (
    id IN (
      SELECT barbershop_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'manager', 'super_admin')
    )
  );

CREATE POLICY "barbershops_insert_authenticated" ON public.barbershops
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- RLS POLICIES - BARBERS
-- =====================================================
CREATE POLICY "barbers_select_same_barbershop" ON public.barbers
  FOR SELECT USING (
    barbershop_id IN (SELECT barbershop_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "barbers_insert_manager" ON public.barbers
  FOR INSERT WITH CHECK (
    barbershop_id IN (
      SELECT barbershop_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'manager', 'super_admin')
    )
  );

CREATE POLICY "barbers_update_manager" ON public.barbers
  FOR UPDATE USING (
    barbershop_id IN (
      SELECT barbershop_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'manager', 'super_admin')
    )
  );

CREATE POLICY "barbers_delete_manager" ON public.barbers
  FOR DELETE USING (
    barbershop_id IN (
      SELECT barbershop_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'manager', 'super_admin')
    )
  );

-- =====================================================
-- RLS POLICIES - SERVICES
-- =====================================================
CREATE POLICY "services_select_same_barbershop" ON public.services
  FOR SELECT USING (
    barbershop_id IN (SELECT barbershop_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "services_insert_manager" ON public.services
  FOR INSERT WITH CHECK (
    barbershop_id IN (
      SELECT barbershop_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'manager', 'super_admin')
    )
  );

CREATE POLICY "services_update_manager" ON public.services
  FOR UPDATE USING (
    barbershop_id IN (
      SELECT barbershop_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'manager', 'super_admin')
    )
  );

CREATE POLICY "services_delete_manager" ON public.services
  FOR DELETE USING (
    barbershop_id IN (
      SELECT barbershop_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'manager', 'super_admin')
    )
  );

-- =====================================================
-- RLS POLICIES - CLIENTS
-- =====================================================
CREATE POLICY "clients_select_same_barbershop" ON public.clients
  FOR SELECT USING (
    barbershop_id IN (SELECT barbershop_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "clients_insert_staff" ON public.clients
  FOR INSERT WITH CHECK (
    barbershop_id IN (
      SELECT barbershop_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'manager', 'barber', 'super_admin')
    )
  );

CREATE POLICY "clients_update_staff" ON public.clients
  FOR UPDATE USING (
    barbershop_id IN (
      SELECT barbershop_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'manager', 'barber', 'super_admin')
    )
  );

CREATE POLICY "clients_delete_manager" ON public.clients
  FOR DELETE USING (
    barbershop_id IN (
      SELECT barbershop_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'manager', 'super_admin')
    )
  );

-- =====================================================
-- RLS POLICIES - APPOINTMENTS
-- =====================================================
CREATE POLICY "appointments_select_same_barbershop" ON public.appointments
  FOR SELECT USING (
    barbershop_id IN (SELECT barbershop_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "appointments_insert_staff" ON public.appointments
  FOR INSERT WITH CHECK (
    barbershop_id IN (
      SELECT barbershop_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'manager', 'barber', 'super_admin')
    )
  );

CREATE POLICY "appointments_update_staff" ON public.appointments
  FOR UPDATE USING (
    barbershop_id IN (
      SELECT barbershop_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'manager', 'barber', 'super_admin')
    )
  );

CREATE POLICY "appointments_delete_manager" ON public.appointments
  FOR DELETE USING (
    barbershop_id IN (
      SELECT barbershop_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'manager', 'super_admin')
    )
  );

-- =====================================================
-- RLS POLICIES - WORKING HOURS
-- =====================================================
CREATE POLICY "working_hours_select_same_barbershop" ON public.working_hours
  FOR SELECT USING (
    barbershop_id IN (SELECT barbershop_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "working_hours_insert_manager" ON public.working_hours
  FOR INSERT WITH CHECK (
    barbershop_id IN (
      SELECT barbershop_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'manager', 'super_admin')
    )
  );

CREATE POLICY "working_hours_update_manager" ON public.working_hours
  FOR UPDATE USING (
    barbershop_id IN (
      SELECT barbershop_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'manager', 'super_admin')
    )
  );

CREATE POLICY "working_hours_delete_manager" ON public.working_hours
  FOR DELETE USING (
    barbershop_id IN (
      SELECT barbershop_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'manager', 'super_admin')
    )
  );

-- =====================================================
-- PROFILE TRIGGER (auto-create on signup)
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'first_name', NULL),
    COALESCE(new.raw_user_meta_data ->> 'last_name', NULL),
    COALESCE(new.raw_user_meta_data ->> 'role', 'client')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_barbershop ON public.profiles(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_barbers_barbershop ON public.barbers(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_services_barbershop ON public.services(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_clients_barbershop ON public.clients(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_appointments_barbershop ON public.appointments(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_appointments_barber ON public.appointments(barber_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON public.appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_working_hours_barbershop ON public.working_hours(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_working_hours_barber ON public.working_hours(barber_id);
