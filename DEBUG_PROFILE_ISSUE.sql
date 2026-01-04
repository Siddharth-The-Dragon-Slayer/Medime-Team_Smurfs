-- =====================================================
-- DEBUG SCRIPT: Run this in Supabase SQL Editor
-- to diagnose why profiles aren't being created
-- =====================================================

-- 1. Check if the trigger function exists
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 2. Check if the trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 3. Check recent users in auth.users
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Check profiles table
SELECT 
  id,
  name,
  email,
  phone,
  emergency_contact_name,
  emergency_contact_relationship,
  created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Check if profiles table has the right structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 6. Test the trigger function manually (replace USER_ID with actual user ID)
-- First, find a user ID from the auth.users query above, then run:
-- SELECT public.handle_new_user() -- This won't work directly, we need to test differently

-- 7. Check for any errors in the logs
-- (This would be visible in Supabase Dashboard > Logs)

-- 8. Manual profile creation test (replace with actual user data)
-- INSERT INTO profiles (id, name, email, phone) 
-- VALUES ('USER_ID_HERE', 'Test Name', 'test@example.com', '+1234567890');

SELECT 'Debug queries completed. Check the results above.' as status;