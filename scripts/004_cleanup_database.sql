-- Cleanup Script for BarberPro Database
-- ⚠️ WARNING: This script DELETES ALL DATA from all tables
-- Use only for testing/development, NOT for production!

-- =====================================================
-- DISABLE FOREIGN KEY CONSTRAINTS TEMPORARILY
-- =====================================================
ALTER TABLE public.whatsapp_messages DISABLE TRIGGER ALL;
ALTER TABLE public.whatsapp_conversations DISABLE TRIGGER ALL;
ALTER TABLE public.appointments DISABLE TRIGGER ALL;
ALTER TABLE public.clients DISABLE TRIGGER ALL;
ALTER TABLE public.barbers DISABLE TRIGGER ALL;
ALTER TABLE public.services DISABLE TRIGGER ALL;
ALTER TABLE public.working_hours DISABLE TRIGGER ALL;
ALTER TABLE public.transactions DISABLE TRIGGER ALL;
ALTER TABLE public.profiles DISABLE TRIGGER ALL;
ALTER TABLE public.barbershops DISABLE TRIGGER ALL;

-- =====================================================
-- DELETE ALL DATA (in reverse order of dependencies)
-- =====================================================
DELETE FROM public.whatsapp_messages;
DELETE FROM public.whatsapp_conversations;
DELETE FROM public.transactions;
DELETE FROM public.appointments;
DELETE FROM public.working_hours;
DELETE FROM public.clients;
DELETE FROM public.barbers;
DELETE FROM public.services;
DELETE FROM public.profiles WHERE barbershop_id IS NOT NULL;
DELETE FROM public.barbershops;

-- =====================================================
-- RE-ENABLE TRIGGERS
-- =====================================================
ALTER TABLE public.barbershops ENABLE TRIGGER ALL;
ALTER TABLE public.profiles ENABLE TRIGGER ALL;
ALTER TABLE public.transactions ENABLE TRIGGER ALL;
ALTER TABLE public.working_hours ENABLE TRIGGER ALL;
ALTER TABLE public.services ENABLE TRIGGER ALL;
ALTER TABLE public.barbers ENABLE TRIGGER ALL;
ALTER TABLE public.clients ENABLE TRIGGER ALL;
ALTER TABLE public.appointments ENABLE TRIGGER ALL;
ALTER TABLE public.whatsapp_conversations ENABLE TRIGGER ALL;
ALTER TABLE public.whatsapp_messages ENABLE TRIGGER ALL;

-- =====================================================
-- RESET SEQUENCES (if any)
-- =====================================================
-- PostgreSQL doesn't use sequences for UUIDs, but if you added any serial columns:
-- SELECT setval('table_name_id_seq', 1, false);

-- =====================================================
-- VERIFY CLEANUP
-- =====================================================
SELECT 
  'barbershops' as table_name,
  COUNT(*) as row_count
FROM public.barbershops
UNION ALL
SELECT 'profiles', COUNT(*) FROM public.profiles
UNION ALL
SELECT 'barbers', COUNT(*) FROM public.barbers
UNION ALL
SELECT 'services', COUNT(*) FROM public.services
UNION ALL
SELECT 'clients', COUNT(*) FROM public.clients
UNION ALL
SELECT 'appointments', COUNT(*) FROM public.appointments
UNION ALL
SELECT 'working_hours', COUNT(*) FROM public.working_hours
UNION ALL
SELECT 'whatsapp_conversations', COUNT(*) FROM public.whatsapp_conversations
UNION ALL
SELECT 'whatsapp_messages', COUNT(*) FROM public.whatsapp_messages
UNION ALL
SELECT 'transactions', COUNT(*) FROM public.transactions;

-- Expected: All tables should show 0 rows

-- If you want to DELETE the entire schema and start fresh, use:
-- DROP SCHEMA IF EXISTS public CASCADE;
-- CREATE SCHEMA public;
-- GRANT ALL ON SCHEMA public TO postgres;
-- GRANT ALL ON SCHEMA public TO public;
-- Then re-run 001_create_barbershop_schema.sql
