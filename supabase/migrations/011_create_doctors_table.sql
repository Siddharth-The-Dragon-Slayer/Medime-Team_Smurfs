-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  license_number TEXT,
  specialization TEXT,
  hospital_affiliation TEXT,
  phone TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Create policies for doctors
CREATE POLICY "Doctors can view own profile" ON doctors
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Doctors can update own profile" ON doctors
  FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Doctors can insert own profile" ON doctors
  FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Create updated_at trigger for doctors
CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create doctor-patient relationships table
CREATE TABLE IF NOT EXISTS doctor_patient_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  relationship_type TEXT CHECK (relationship_type IN ('primary', 'consulting', 'specialist')) DEFAULT 'primary',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(doctor_id, patient_id)
);

-- Enable RLS for doctor_patient_relationships
ALTER TABLE doctor_patient_relationships ENABLE ROW LEVEL SECURITY;

-- Create policies for doctor_patient_relationships
CREATE POLICY "Doctors can view their patient relationships" ON doctor_patient_relationships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM doctors 
      WHERE doctors.auth_id = auth.uid() 
      AND doctors.id = doctor_patient_relationships.doctor_id
    )
  );

CREATE POLICY "Doctors can manage their patient relationships" ON doctor_patient_relationships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM doctors 
      WHERE doctors.auth_id = auth.uid() 
      AND doctors.id = doctor_patient_relationships.doctor_id
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doctors_auth_id ON doctors(auth_id);
CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email);
CREATE INDEX IF NOT EXISTS idx_doctor_patient_relationships_doctor_id ON doctor_patient_relationships(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_patient_relationships_patient_id ON doctor_patient_relationships(patient_id);

-- Function to automatically create doctor profile after auth signup
CREATE OR REPLACE FUNCTION public.handle_new_doctor()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create doctor profile if user_metadata contains doctor flag
  IF NEW.raw_user_meta_data->>'user_type' = 'doctor' THEN
    INSERT INTO public.doctors (auth_id, name, email, license_number, specialization, hospital_affiliation, phone)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      NEW.email,
      NEW.raw_user_meta_data->>'license_number',
      NEW.raw_user_meta_data->>'specialization',
      NEW.raw_user_meta_data->>'hospital_affiliation',
      NEW.raw_user_meta_data->>'phone'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new doctor signup
DROP TRIGGER IF EXISTS on_auth_user_created_doctor ON auth.users;
CREATE TRIGGER on_auth_user_created_doctor
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_doctor();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.doctors TO anon, authenticated;
GRANT ALL ON public.doctor_patient_relationships TO anon, authenticated;