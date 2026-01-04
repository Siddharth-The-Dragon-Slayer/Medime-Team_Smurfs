-- Add FHIR support to profiles, medications, and vitals tables

-- Add FHIR ID to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fhir_id TEXT;

-- Add FHIR medication ID to medications table
ALTER TABLE medications ADD COLUMN IF NOT EXISTS fhir_medication_id TEXT;

-- Add FHIR observation ID to vitals table
ALTER TABLE vitals ADD COLUMN IF NOT EXISTS fhir_observation_id TEXT;

-- Create index for FHIR ID lookups
CREATE INDEX IF NOT EXISTS idx_profiles_fhir_id ON profiles(fhir_id);
CREATE INDEX IF NOT EXISTS idx_medications_fhir_id ON medications(fhir_medication_id);
CREATE INDEX IF NOT EXISTS idx_vitals_fhir_id ON vitals(fhir_observation_id);

-- Add comments for documentation
COMMENT ON COLUMN profiles.fhir_id IS 'FHIR Patient ID from external FHIR server';
COMMENT ON COLUMN medications.fhir_medication_id IS 'FHIR MedicationRequest ID from external FHIR server';
COMMENT ON COLUMN vitals.fhir_observation_id IS 'FHIR Observation ID from external FHIR server';