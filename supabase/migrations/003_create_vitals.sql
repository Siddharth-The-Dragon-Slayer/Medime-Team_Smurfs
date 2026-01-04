-- Create vitals table for storing user health metrics
CREATE TABLE IF NOT EXISTS vitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  temperature_celsius DECIMAL(4,2), -- body temperature in Celsius
  humidity_percent DECIMAL(5,2), -- environmental humidity percentage
  oxygen_level_percent DECIMAL(5,2), -- blood oxygen saturation (SpO2)
  heart_rate_bpm INTEGER, -- heart rate in beats per minute
  blood_pressure_systolic INTEGER, -- systolic blood pressure
  blood_pressure_diastolic INTEGER, -- diastolic blood pressure
  blood_sugar_mg_dl DECIMAL(6,2), -- blood glucose in mg/dL
  weight_kg DECIMAL(5,2), -- current weight
  notes TEXT,
  measurement_source TEXT CHECK (measurement_source IN ('manual', 'device', 'wearable', 'hospital')),
  device_id TEXT, -- identifier for the measuring device
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;

-- Create policies for vitals
CREATE POLICY "Users can view own vitals" ON vitals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vitals" ON vitals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vitals" ON vitals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vitals" ON vitals
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_vitals_user_id_recorded_at ON vitals(user_id, recorded_at DESC);
CREATE INDEX idx_vitals_recorded_at ON vitals(recorded_at DESC);

-- Create vital_alerts table for emergency thresholds
CREATE TABLE IF NOT EXISTS vital_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vital_type TEXT NOT NULL CHECK (vital_type IN ('temperature', 'oxygen_level', 'heart_rate', 'blood_pressure', 'blood_sugar')),
  min_threshold DECIMAL(10,2),
  max_threshold DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  alert_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for vital_alerts
ALTER TABLE vital_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for vital_alerts
CREATE POLICY "Users can manage own vital alerts" ON vital_alerts
  FOR ALL USING (auth.uid() = user_id);

-- Create updated_at trigger for vital_alerts
CREATE TRIGGER update_vital_alerts_updated_at
  BEFORE UPDATE ON vital_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();