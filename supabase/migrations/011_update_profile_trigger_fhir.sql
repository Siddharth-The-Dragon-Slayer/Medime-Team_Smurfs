-- Update the profile creation function to include FHIR ID
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_metadata JSONB;
BEGIN
  -- Get user metadata from auth.users
  SELECT raw_user_meta_data INTO user_metadata
  FROM auth.users
  WHERE id = NEW.id;

  -- Insert profile with data from metadata including FHIR ID
  INSERT INTO public.profiles (
    id,
    name,
    email,
    phone,
    emergency_contact_name,
    emergency_contact_relationship,
    fhir_id
  ) VALUES (
    NEW.id,
    COALESCE(user_metadata->>'name', NEW.email),
    NEW.email,
    user_metadata->>'phone_number',
    user_metadata->>'caretaker_name',
    user_metadata->>'relation',
    user_metadata->>'fhir_id'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the profile update function to include FHIR ID
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
  user_emergency_contact_relationship TEXT DEFAULT NULL,
  user_fhir_id TEXT DEFAULT NULL
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
    fhir_id = COALESCE(user_fhir_id, fhir_id),
    updated_at = NOW()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;