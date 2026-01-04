-- Add FHIR ID field to profiles table
ALTER TABLE profiles 
ADD COLUMN fhir_id TEXT UNIQUE;

-- Add comment to explain the field
COMMENT ON COLUMN profiles.fhir_id IS 'FHIR (Fast Healthcare Interoperability Resources) patient identifier for healthcare data exchange';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_fhir_id ON profiles(fhir_id);

-- Update the updated_at timestamp when this migration runs
UPDATE profiles SET updated_at = NOW() WHERE fhir_id IS NULL;