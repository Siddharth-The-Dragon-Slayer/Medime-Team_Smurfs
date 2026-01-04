-- Create fcm_tokens table for storing Firebase Cloud Messaging tokens
CREATE TABLE IF NOT EXISTS fcm_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  device_type TEXT DEFAULT 'web', -- 'web', 'android', 'ios'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_id ON fcm_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_token ON fcm_tokens(token);

-- Enable RLS
ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own FCM tokens"
  ON fcm_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own FCM tokens"
  ON fcm_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own FCM tokens"
  ON fcm_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own FCM tokens"
  ON fcm_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Update medication_logs table to track notifications
ALTER TABLE medication_logs 
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMP WITH TIME ZONE;

-- Create index for notification queries
CREATE INDEX IF NOT EXISTS idx_medication_logs_notification ON medication_logs(notification_sent, scheduled_time);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_fcm_tokens_updated_at
    BEFORE UPDATE ON fcm_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
