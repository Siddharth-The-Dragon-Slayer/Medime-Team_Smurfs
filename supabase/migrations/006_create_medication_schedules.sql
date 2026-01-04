-- Create medication_schedules table
CREATE TABLE IF NOT EXISTS medication_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  scheduled_time TIME NOT NULL,
  days_of_week TEXT[] NOT NULL, -- Array of day names: ['monday', 'tuesday', etc.]
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE medication_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for medication_schedules
CREATE POLICY "Users can view own medication schedules" ON medication_schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medication schedules" ON medication_schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medication schedules" ON medication_schedules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medication schedules" ON medication_schedules
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_medication_schedules_updated_at
  BEFORE UPDATE ON medication_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_medication_schedules_user_id ON medication_schedules(user_id);
CREATE INDEX idx_medication_schedules_active ON medication_schedules(user_id, is_active);
CREATE INDEX idx_medication_schedules_time ON medication_schedules(scheduled_time);