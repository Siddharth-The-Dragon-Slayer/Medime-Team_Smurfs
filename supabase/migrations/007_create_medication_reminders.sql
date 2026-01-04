-- Create medication_reminders table
CREATE TABLE IF NOT EXISTS medication_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medication_schedule_id UUID REFERENCES medication_schedules(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  reminder_times TIME[] NOT NULL, -- Array of reminder times
  is_enabled BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  vibration_enabled BOOLEAN DEFAULT true,
  snooze_minutes INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE medication_reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for medication_reminders
CREATE POLICY "Users can view own medication reminders" ON medication_reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medication reminders" ON medication_reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medication reminders" ON medication_reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medication reminders" ON medication_reminders
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_medication_reminders_updated_at
  BEFORE UPDATE ON medication_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_medication_reminders_user_id ON medication_reminders(user_id);
CREATE INDEX idx_medication_reminders_enabled ON medication_reminders(user_id, is_enabled);
CREATE INDEX idx_medication_reminders_schedule_id ON medication_reminders(medication_schedule_id);