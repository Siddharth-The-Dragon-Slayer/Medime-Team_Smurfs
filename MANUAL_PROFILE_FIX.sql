-- =====================================================
-- MANUAL PROFILE CREATION FIX
-- If the trigger isn't working, run this to create profiles
-- for existing users who don't have them
-- =====================================================

-- Create profiles for users who don't have them yet
INSERT INTO public.profiles (
  id,
  name,
  email,
  phone,
  emergency_contact_name,
  emergency_contact_relationship,
  created_at,
  updated_at
)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', u.email) as name,
  u.email,
  u.raw_user_meta_data->>'phone_number' as phone,
  u.raw_user_meta_data->>'caretaker_name' as emergency_contact_name,
  u.raw_user_meta_data->>'relation' as emergency_contact_relationship,
  u.created_at,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Check how many profiles were created
SELECT COUNT(*) as profiles_created FROM (
  SELECT u.id
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE p.id IS NULL
) as missing_profiles;

-- Verify all users now have profiles
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM profiles) 
    THEN 'All users have profiles ✓'
    ELSE 'Some users missing profiles ✗'
  END as status;