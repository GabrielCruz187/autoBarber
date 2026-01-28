-- Fix RLS Policies for barbershops table
-- This script ensures barbershops can be queried by authenticated users

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable barbershop owner to read their own barbershop" ON barbershops;
DROP POLICY IF EXISTS "Enable barbershop owner to update their own barbershop" ON barbershops;
DROP POLICY IF EXISTS "Enable barbershop owner to insert barbershop" ON barbershops;
DROP POLICY IF EXISTS "Enable authenticated users to read barbershops" ON barbershops;

-- Create new policies for barbershops
CREATE POLICY "Enable authenticated to read barbershops"
ON barbershops FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Enable owner to update barbershop"
ON barbershops FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Enable authenticated to insert barbershop"
ON barbershops FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Fix RLS Policies for profiles table
DROP POLICY IF EXISTS "Enable user to read own profile" ON profiles;
DROP POLICY IF EXISTS "Enable user to update own profile" ON profiles;

CREATE POLICY "Enable user to read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Enable user to update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Fix RLS Policies for services table
DROP POLICY IF EXISTS "Enable authorized users to read services" ON services;
DROP POLICY IF EXISTS "Enable barbershop owner to manage services" ON services;

CREATE POLICY "Enable reading services of own barbershop"
ON services FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM barbershops
    WHERE barbershops.id = services.barbershop_id
    AND barbershops.owner_id = auth.uid()
  )
  OR
  is_active = true
);

CREATE POLICY "Enable owner to manage services"
ON services FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM barbershops
    WHERE barbershops.id = services.barbershop_id
    AND barbershops.owner_id = auth.uid()
  )
);

-- Fix RLS Policies for barbers table
DROP POLICY IF EXISTS "Enable reading barbers of own barbershop" ON barbers;

CREATE POLICY "Enable reading barbers of own barbershop"
ON barbers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM barbershops
    WHERE barbershops.id = barbers.barbershop_id
    AND barbershops.owner_id = auth.uid()
  )
  OR
  is_active = true
);

-- Fix RLS Policies for clients table
DROP POLICY IF EXISTS "Enable reading own clients" ON clients;

CREATE POLICY "Enable reading own clients"
ON clients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM barbershops
    WHERE barbershops.id = clients.barbershop_id
    AND barbershops.owner_id = auth.uid()
  )
);

-- Fix RLS Policies for appointments table
DROP POLICY IF EXISTS "Enable reading own appointments" ON appointments;

CREATE POLICY "Enable reading own appointments"
ON appointments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM barbershops
    WHERE barbershops.id = appointments.barbershop_id
    AND barbershops.owner_id = auth.uid()
  )
);

-- Fix RLS Policies for working_hours table
DROP POLICY IF EXISTS "Enable reading own working hours" ON working_hours;

CREATE POLICY "Enable reading own working hours"
ON working_hours FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM barbershops
    WHERE barbershops.id = working_hours.barbershop_id
    AND barbershops.owner_id = auth.uid()
  )
);

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
