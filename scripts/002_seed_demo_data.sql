-- Demo Data Seed for BarberPro
-- This script inserts sample data for testing and demo purposes
-- Make sure to create a test user first via Supabase Auth

-- Insert demo barbershop (replace uuid with actual user id from auth)
-- Example: If your auth user ID is 'user-uuid-123', use that
INSERT INTO public.barbershops (
  owner_id,
  name,
  slug,
  description,
  address,
  city,
  state,
  zip_code,
  country,
  phone,
  email,
  website,
  timezone,
  currency,
  is_active
) VALUES (
  '1afa489f-16cb-4e0a-a1dd-7accded63f47',
  'My Barbershop',
  'my-barbershop',
  'The best barbershop in town',
  '123 Main Street',
  'New York',
  'NY',
  '10001',
  'USA',
  '+1-555-0123',
  'contact@mybarbershop.com',
  'https://mybarbershop.com',
  'America/New_York',
  'USD',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Insert demo services (you'll need to replace barbershop_id)
INSERT INTO public.services (
  barbershop_id,
  name,
  description,
  category,
  duration_minutes,
  price,
  is_active
) SELECT
  b.id,
  s.name,
  s.description,
  s.category,
  s.duration_minutes,
  s.price,
  true
FROM public.barbershops b
CROSS JOIN (
  VALUES
    ('Haircut', 'Classic haircut service', 'Haircut', 30, 25.00),
    ('Beard Trim', 'Professional beard trimming', 'Beard', 20, 15.00),
    ('Fade', 'Fade haircut with sharp lines', 'Haircut', 35, 30.00),
    ('Full Grooming', 'Haircut + beard + styling', 'Package', 60, 50.00),
    ('Hair Wash', 'Relaxing hair wash with massage', 'Add-on', 10, 5.00)
  ) s(name, description, category, duration_minutes, price)
WHERE b.slug = 'my-barbershop'
ON CONFLICT DO NOTHING;

-- Insert demo barbers (you'll need to replace barbershop_id)
INSERT INTO public.barbers (
  barbershop_id,
  first_name,
  last_name,
  email,
  phone,
  bio,
  commission_rate,
  is_active
) SELECT
  b.id,
  b_data.first_name,
  b_data.last_name,
  b_data.email,
  b_data.phone,
  b_data.bio,
  50.00,
  true
FROM public.barbershops bs
CROSS JOIN (
  VALUES
    ('John', 'Smith', 'john@mybarbershop.com', '+1-555-0111', '10+ years of experience in barbering'),
    ('Carlos', 'Rodriguez', 'carlos@mybarbershop.com', '+1-555-0112', 'Specialist in fades and design cuts'),
    ('Mike', 'Johnson', 'mike@mybarbershop.com', '+1-555-0113', 'Expert in vintage and classic styles')
  ) b_data(first_name, last_name, email, phone, bio)
WHERE bs.slug = 'my-barbershop'
ON CONFLICT DO NOTHING;

-- Insert demo working hours (Mon-Fri 9am-6pm, Sat 9am-5pm)
INSERT INTO public.working_hours (
  barbershop_id,
  day_of_week,
  start_time,
  end_time,
  is_available
) SELECT
  b.id,
  day.day_of_week,
  day.start_time,
  day.end_time,
  true
FROM public.barbershops b
CROSS JOIN (
  VALUES
    (1, '09:00:00'::time, '18:00:00'::time),  -- Monday
    (2, '09:00:00'::time, '18:00:00'::time),  -- Tuesday
    (3, '09:00:00'::time, '18:00:00'::time),  -- Wednesday
    (4, '09:00:00'::time, '18:00:00'::time),  -- Thursday
    (5, '09:00:00'::time, '18:00:00'::time),  -- Friday
    (6, '09:00:00'::time, '17:00:00'::time)   -- Saturday
  ) day(day_of_week, start_time, end_time)
WHERE b.slug = 'my-barbershop'
ON CONFLICT DO NOTHING;
