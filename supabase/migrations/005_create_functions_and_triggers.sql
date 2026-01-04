-- Function to check vital alerts and create notifications
CREATE OR REPLACE FUNCTION check_vital_alerts()
RETURNS TRIGGER AS $$
DECLARE
  alert_record RECORD;
  alert_message TEXT;
BEGIN
  -- Check temperature alerts
  IF NEW.temperature_celsius IS NOT NULL THEN
    FOR alert_record IN 
      SELECT * FROM vital_alerts 
      WHERE user_id = NEW.user_id 
        AND vital_type = 'temperature' 
        AND is_active = true
    LOOP
      IF (alert_record.min_threshold IS NOT NULL AND NEW.temperature_celsius < alert_record.min_threshold) OR
         (alert_record.max_threshold IS NOT NULL AND NEW.temperature_celsius > alert_record.max_threshold) THEN
        
        alert_message := COALESCE(alert_record.alert_message, 
          'Temperature alert: ' || NEW.temperature_celsius || '°C is outside normal range');
        
        INSERT INTO notifications (user_id, title, message, type, priority, is_emergency, related_vital_id, metadata)
        VALUES (NEW.user_id, 'Temperature Alert', alert_message, 'vital_alert', 'high', true, NEW.id, 
                jsonb_build_object('vital_type', 'temperature', 'value', NEW.temperature_celsius, 'threshold_min', alert_record.min_threshold, 'threshold_max', alert_record.max_threshold));
      END IF;
    END LOOP;
  END IF;

  -- Check oxygen level alerts
  IF NEW.oxygen_level_percent IS NOT NULL THEN
    FOR alert_record IN 
      SELECT * FROM vital_alerts 
      WHERE user_id = NEW.user_id 
        AND vital_type = 'oxygen_level' 
        AND is_active = true
    LOOP
      IF (alert_record.min_threshold IS NOT NULL AND NEW.oxygen_level_percent < alert_record.min_threshold) OR
         (alert_record.max_threshold IS NOT NULL AND NEW.oxygen_level_percent > alert_record.max_threshold) THEN
        
        alert_message := COALESCE(alert_record.alert_message, 
          'Oxygen level alert: ' || NEW.oxygen_level_percent || '% is outside normal range');
        
        INSERT INTO notifications (user_id, title, message, type, priority, is_emergency, related_vital_id, metadata)
        VALUES (NEW.user_id, 'Oxygen Level Alert', alert_message, 'vital_alert', 'critical', true, NEW.id,
                jsonb_build_object('vital_type', 'oxygen_level', 'value', NEW.oxygen_level_percent, 'threshold_min', alert_record.min_threshold, 'threshold_max', alert_record.max_threshold));
      END IF;
    END LOOP;
  END IF;

  -- Check heart rate alerts
  IF NEW.heart_rate_bpm IS NOT NULL THEN
    FOR alert_record IN 
      SELECT * FROM vital_alerts 
      WHERE user_id = NEW.user_id 
        AND vital_type = 'heart_rate' 
        AND is_active = true
    LOOP
      IF (alert_record.min_threshold IS NOT NULL AND NEW.heart_rate_bpm < alert_record.min_threshold) OR
         (alert_record.max_threshold IS NOT NULL AND NEW.heart_rate_bpm > alert_record.max_threshold) THEN
        
        alert_message := COALESCE(alert_record.alert_message, 
          'Heart rate alert: ' || NEW.heart_rate_bpm || ' BPM is outside normal range');
        
        INSERT INTO notifications (user_id, title, message, type, priority, is_emergency, related_vital_id, metadata)
        VALUES (NEW.user_id, 'Heart Rate Alert', alert_message, 'vital_alert', 'high', true, NEW.id,
                jsonb_build_object('vital_type', 'heart_rate', 'value', NEW.heart_rate_bpm, 'threshold_min', alert_record.min_threshold, 'threshold_max', alert_record.max_threshold));
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vital alerts
CREATE TRIGGER trigger_check_vital_alerts
  AFTER INSERT ON vitals
  FOR EACH ROW
  EXECUTE FUNCTION check_vital_alerts();

-- Function to create medication reminders
CREATE OR REPLACE FUNCTION create_medication_reminders()
RETURNS TRIGGER AS $$
DECLARE
  reminder_time TIME;
  reminder_datetime TIMESTAMP WITH TIME ZONE;
  current_date DATE := CURRENT_DATE;
BEGIN
  -- Only create reminders for active medications with reminders enabled
  IF NEW.is_active = true AND NEW.reminder_enabled = true AND NEW.reminder_times IS NOT NULL THEN
    -- Create reminders for each time in the reminder_times array
    FOREACH reminder_time IN ARRAY NEW.reminder_times
    LOOP
      -- Create reminder for today if the time hasn't passed yet
      reminder_datetime := current_date + reminder_time;
      
      IF reminder_datetime > NOW() THEN
        INSERT INTO notifications (user_id, title, message, type, priority, related_medication_id, scheduled_for)
        VALUES (
          NEW.user_id,
          'Medication Reminder',
          'Time to take your medication: ' || NEW.name || ' (' || NEW.dosage || ')',
          'medication',
          'medium',
          NEW.id,
          reminder_datetime
        );
      END IF;
      
      -- Create reminder for tomorrow
      reminder_datetime := (current_date + INTERVAL '1 day') + reminder_time;
      INSERT INTO notifications (user_id, title, message, type, priority, related_medication_id, scheduled_for)
      VALUES (
        NEW.user_id,
        'Medication Reminder',
        'Time to take your medication: ' || NEW.name || ' (' || NEW.dosage || ')',
        'medication',
        'medium',
        NEW.id,
        reminder_datetime
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for medication reminders
CREATE TRIGGER trigger_create_medication_reminders
  AFTER INSERT OR UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION create_medication_reminders();

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email);
  
  -- Create default vital alert thresholds
  INSERT INTO vital_alerts (user_id, vital_type, min_threshold, max_threshold, alert_message) VALUES
    (NEW.id, 'temperature', 35.0, 38.5, 'Body temperature is outside normal range'),
    (NEW.id, 'oxygen_level', 90.0, NULL, 'Blood oxygen level is critically low'),
    (NEW.id, 'heart_rate', 50, 120, 'Heart rate is outside normal range');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user handling
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();