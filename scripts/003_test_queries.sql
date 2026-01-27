-- Test Queries for BarberPro Database
-- Execute these queries to verify your database setup is working correctly

-- =====================================================
-- TEST 1: Check if all tables exist
-- =====================================================
SELECT 
  tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected: 10 tables (barbershops, profiles, barbers, services, clients, appointments, working_hours, whatsapp_conversations, whatsapp_messages, transactions)

-- =====================================================
-- TEST 2: Check if RLS is enabled
-- =====================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('barbershops', 'profiles', 'barbers', 'services', 'clients', 'appointments', 'working_hours', 'whatsapp_conversations', 'whatsapp_messages', 'transactions');

-- Expected: All tables should have rowsecurity = true

-- =====================================================
-- TEST 3: Count all RLS policies
-- =====================================================
SELECT COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public';

-- Expected: 50+ policies

-- =====================================================
-- TEST 4: List all triggers
-- =====================================================
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- Expected: Should see on_auth_user_created and on_barbershop_updated triggers

-- =====================================================
-- TEST 5: Check if demo data was inserted (if you ran seed script)
-- =====================================================
SELECT 
  COUNT(*) as barbershop_count,
  'barbershops' as table_name
FROM public.barbershops
UNION ALL
SELECT 
  COUNT(*) as service_count,
  'services' as table_name
FROM public.services
UNION ALL
SELECT 
  COUNT(*) as barber_count,
  'barbers' as table_name
FROM public.barbers
UNION ALL
SELECT 
  COUNT(*) as client_count,
  'clients' as table_name
FROM public.clients
UNION ALL
SELECT 
  COUNT(*) as appointment_count,
  'appointments' as table_name
FROM public.appointments
UNION ALL
SELECT 
  COUNT(*) as working_hours_count,
  'working_hours' as table_name
FROM public.working_hours;

-- =====================================================
-- TEST 6: View barbershop details (if demo data exists)
-- =====================================================
SELECT 
  id,
  name,
  slug,
  email,
  phone,
  is_active,
  created_at
FROM public.barbershops
LIMIT 5;

-- =====================================================
-- TEST 7: Check services for a barbershop (if demo data exists)
-- =====================================================
SELECT 
  b.name as barbershop_name,
  s.id,
  s.name,
  s.description,
  s.duration_minutes,
  s.price,
  s.is_active
FROM public.barbershops b
LEFT JOIN public.services s ON b.id = s.barbershop_id
LIMIT 10;

-- =====================================================
-- TEST 8: Check barbers for a barbershop (if demo data exists)
-- =====================================================
SELECT 
  b.name as barbershop_name,
  br.id,
  br.first_name,
  br.last_name,
  br.email,
  br.phone,
  br.is_active
FROM public.barbershops b
LEFT JOIN public.barbers br ON b.id = br.barbershop_id
LIMIT 10;

-- =====================================================
-- TEST 9: Check working hours (if demo data exists)
-- =====================================================
SELECT 
  b.name as barbershop_name,
  CASE 
    WHEN wh.day_of_week = 0 THEN 'Sunday'
    WHEN wh.day_of_week = 1 THEN 'Monday'
    WHEN wh.day_of_week = 2 THEN 'Tuesday'
    WHEN wh.day_of_week = 3 THEN 'Wednesday'
    WHEN wh.day_of_week = 4 THEN 'Thursday'
    WHEN wh.day_of_week = 5 THEN 'Friday'
    WHEN wh.day_of_week = 6 THEN 'Saturday'
  END as day_name,
  wh.start_time,
  wh.end_time,
  wh.is_available
FROM public.barbershops b
LEFT JOIN public.working_hours wh ON b.id = wh.barbershop_id
ORDER BY b.name, wh.day_of_week;

-- =====================================================
-- TEST 10: Verify foreign key relationships
-- =====================================================
-- Check if services reference valid barbershops
SELECT COUNT(*) as orphan_services
FROM public.services s
WHERE s.barbershop_id NOT IN (SELECT id FROM public.barbershops);

-- Check if barbers reference valid barbershops
SELECT COUNT(*) as orphan_barbers
FROM public.barbers b
WHERE b.barbershop_id NOT IN (SELECT id FROM public.barbershops);

-- Check if clients reference valid barbershops
SELECT COUNT(*) as orphan_clients
FROM public.clients c
WHERE c.barbershop_id NOT IN (SELECT id FROM public.barbershops);

-- Expected: All should return 0 (no orphan records)

-- =====================================================
-- TEST 11: Check indexes
-- =====================================================
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Expected: Should see performance indexes for common queries

-- =====================================================
-- TEST 12: Test function (check if handle_new_user exists)
-- =====================================================
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname = 'handle_new_user'
  AND pg_get_functiondef(oid) IS NOT NULL;

-- Expected: Should see the handle_new_user function

-- =====================================================
-- MANUAL TESTS
-- =====================================================

-- To manually test INSERT, UPDATE, DELETE:
-- You'll need to set up RLS context with a valid user_id

-- Example: To test as if you're logged in with a specific user:
-- 1. Get your actual user UUID from auth.users
-- 2. Run: SELECT set_config('request.jwt.claims'::text, json_build_object('sub', 'your-uuid-here')::text, false);
-- 3. Then try to insert/update/delete records

-- Your database is ready to use!
