-- Create SMS logs table to track sent messages
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reminder_id UUID REFERENCES medication_reminders(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  twilio_sid TEXT,
  status TEXT CHECK (status IN ('sent', 'failed', 'delivered', 'undelivered')) DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for sms_logs
CREATE POLICY "Users can view own SMS logs" ON sms_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert SMS logs" ON sms_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update SMS logs" ON sms_logs
  FOR UPDATE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_sms_logs_user_id ON sms_logs(user_id);
CREATE INDEX idx_sms_logs_reminder_id ON sms_logs(reminder_id);
CREATE INDEX idx_sms_logs_sent_at ON sms_logs(sent_at DESC);
CREATE INDEX idx_sms_logs_status ON sms_logs(status);

-- Add phone number to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE profiles ADD COLUMN phone TEXT;
    END IF;
END $$;

-- Create a function to check if it's time to send reminders
CREATE OR REPLACE FUNCTION check_reminder_time()
RETURNS TABLE(
  reminder_id UUID,
  user_id UUID,
  medication_name TEXT,
  phone_number TEXT,
  user_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mr.id as reminder_id,
    mr.user_id,
    mr.medication_name,
    p.phone as phone_number,
    p.name as user_name
  FROM medication_reminders mr
  JOIN profiles p ON mr.user_id = p.id
  WHERE mr.is_enabled = true
    AND p.phone IS NOT NULL
    AND p.phone != ''
    AND EXTRACT(HOUR FROM NOW()) || ':' || LPAD(EXTRACT(MINUTE FROM NOW())::TEXT, 2, '0') = ANY(
      SELECT unnest(mr.reminder_times)::TEXT
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;