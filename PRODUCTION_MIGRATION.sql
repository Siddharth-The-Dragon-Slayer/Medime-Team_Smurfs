-- =====================================================
-- PRODUCTION MIGRATION: Profile Creation & Management
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Create a function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_metadata JSONB;
BEGIN
  -- Get user metadata from auth.users
  SELECT raw_user_meta_data INTO user_metadata
  FROM auth.users
  WHERE id = NEW.id;

  -- Insert profile with data from metadata
  INSERT INTO public.profiles (
    id,
    name,
    email,
    phone,
    emergency_contact_name,
    emergency_contact_relationship
  ) VALUES (
    NEW.id,
    COALESCE(user_metadata->>'name', NEW.email),
    NEW.email,
    user_metadata->>'phone_number',
    user_metadata->>'caretaker_name',
    user_metadata->>'relation'
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to update user profile
CREATE OR REPLACE FUNCTION public.update_user_profile(
  user_name TEXT DEFAULT NULL,
  user_phone TEXT DEFAULT NULL,
  user_date_of_birth DATE DEFAULT NULL,
  user_gender TEXT DEFAULT NULL,
  user_blood_type TEXT DEFAULT NULL,
  user_height_cm INTEGER DEFAULT NULL,
  user_weight_kg DECIMAL(5,2) DEFAULT NULL,
  user_medical_conditions TEXT[] DEFAULT NULL,
  user_allergies TEXT[] DEFAULT NULL,
  user_emergency_contact_name TEXT DEFAULT NULL,
  user_emergency_contact_phone TEXT DEFAULT NULL,
  user_emergency_contact_relationship TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles SET
    name = COALESCE(user_name, name),
    phone = COALESCE(user_phone, phone),
    date_of_birth = COALESCE(user_date_of_birth, date_of_birth),
    gender = COALESCE(user_gender, gender),
    blood_type = COALESCE(user_blood_type, blood_type),
    height_cm = COALESCE(user_height_cm, height_cm),
    weight_kg = COALESCE(user_weight_kg, weight_kg),
    medical_conditions = COALESCE(user_medical_conditions, medical_conditions),
    allergies = COALESCE(user_allergies, allergies),
    emergency_contact_name = COALESCE(user_emergency_contact_name, emergency_contact_name),
    emergency_contact_phone = COALESCE(user_emergency_contact_phone, emergency_contact_phone),
    emergency_contact_relationship = COALESCE(user_emergency_contact_relationship, emergency_contact_relationship),
    updated_at = NOW()
  WHERE id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.update_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user TO service_role;

-- Ensure phone column exists in profiles table (if not already added)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE profiles ADD COLUMN phone TEXT;
    END IF;
END $$;

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Verify the setup
SELECT 'Migration completed successfully!' as status;