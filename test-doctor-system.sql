-- Test script to verify doctor system setup
-- This script can be run in Supabase SQL editor to test the doctor functionality

-- 1. Check if doctors table exists and has correct structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'doctors' 
ORDER BY ordinal_position;

-- 2. Check if doctor_patient_relationships table exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'doctor_patient_relationships' 
ORDER BY ordinal_position;

-- 3. Sample doctor data (this would be created via signup)
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
-- VALUES (
--   gen_random_uuid(),
--   'doctor@test.com',
--   crypt('password123', gen_salt('bf')),
--   NOW(),
--   '{"user_type": "doctor", "name": "Dr. Test Doctor", "license_number": "MD123456", "specialization": "General Practice"}'::jsonb
-- );

-- 4. Check existing doctors
SELECT d.*, au.email as auth_email
FROM doctors d
LEFT JOIN auth.users au ON d.auth_id = au.id;

-- 5. Check doctor-patient relationships
SELECT 
  dpr.*,
  d.name as doctor_name,
  p.name as patient_name,
  p.email as patient_email
FROM doctor_patient_relationships dpr
LEFT JOIN doctors d ON dpr.doctor_id = d.id
LEFT JOIN profiles p ON dpr.patient_id = p.id;

-- 6. Check if triggers are working
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%doctor%';

-- 7. Test RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('doctors', 'doctor_patient_relationships');