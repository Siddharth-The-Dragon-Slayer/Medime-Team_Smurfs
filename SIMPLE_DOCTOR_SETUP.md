# Simple Doctor Setup - Manual Approach

Since the automatic approach isn't working, let's do this manually to get you up and running quickly.

## Step 1: Create the Tables Manually

Go to your Supabase SQL Editor and run this simplified version:

```sql
-- Create doctors table (simplified)
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

-- Create doctor-patient relationships table
CREATE TABLE IF NOT EXISTS doctor_patient_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  relationship_type TEXT DEFAULT 'primary',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(doctor_id, patient_id)
);

-- Enable RLS
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_patient_relationships ENABLE ROW LEVEL SECURITY;

-- Simple policies
CREATE POLICY "Enable all for authenticated users" ON doctors FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON doctor_patient_relationships FOR ALL USING (auth.role() = 'authenticated');
```

## Step 2: Create a Test Doctor Account Manually

After running the above SQL, run this to create a test doctor:

```sql
-- First, create a regular user account (you'll need to do this via the signup page)
-- Then run this to make them a doctor:

-- Replace 'doctor@test.com' with the email you want to use
-- Replace 'YOUR_USER_ID_HERE' with the actual user ID from auth.users table

INSERT INTO doctors (auth_id, name, email, license_number, specialization, hospital_affiliation, phone)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'doctor@test.com'),
  'Dr. Test Doctor',
  'doctor@test.com',
  'MD123456',
  'General Practice',
  'Test Hospital',
  '+1234567890'
);
```

## Step 3: Test the Login

1. First create a regular account at: http://localhost:3001/auth/sign-up
2. Use email: doctor@test.com
3. Then run the INSERT SQL above to make that user a doctor
4. Try logging in at: http://localhost:3001/auth/doctor-login

This manual approach will definitely work!