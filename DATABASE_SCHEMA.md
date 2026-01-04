# MediMe Database Schema

This document outlines the complete database schema for the MediMe application, including tables for user management, medications, vitals monitoring, and emergency notifications.

## Tables Overview

### 1. Profiles Table
Extends Supabase's built-in `auth.users` table with additional user information.

**Fields:**
- `id` - UUID (Primary Key, references auth.users)
- `name` - User's full name
- `email` - User's email address
- `phone` - Contact phone number
- `date_of_birth` - User's birth date
- `gender` - Gender (male/female/other)
- `blood_type` - Blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)
- `height_cm` - Height in centimeters
- `weight_kg` - Weight in kilograms
- `medical_conditions` - Array of medical conditions
- `allergies` - Array of known allergies
- `emergency_contact_*` - Emergency contact information
- `created_at`, `updated_at` - Timestamps

### 2. Medications Table
Stores user medications and dosage information.

**Fields:**
- `id` - UUID (Primary Key)
- `user_id` - References auth.users
- `name` - Medication name
- `dosage` - Dosage amount and unit
- `frequency` - How often to take (e.g., "twice daily")
- `frequency_times` - Number of times per day
- `start_date`, `end_date` - Treatment period
- `instructions` - Special instructions
- `side_effects` - Known side effects
- `medication_type` - Type (tablet, capsule, liquid, etc.)
- `prescribed_by` - Doctor's name
- `is_active` - Whether medication is currently active
- `reminder_enabled` - Whether to send reminders
- `reminder_times` - Array of specific reminder times
- `created_at`, `updated_at` - Timestamps

### 3. Medication Logs Table
Tracks when medications are taken or missed.

**Fields:**
- `id` - UUID (Primary Key)
- `user_id` - References auth.users
- `medication_id` - References medications
- `scheduled_time` - When medication should be taken
- `taken_time` - When medication was actually taken
- `status` - pending/taken/missed/skipped
- `notes` - Additional notes
- `created_at` - Timestamp

### 4. Vitals Table
Stores health measurements and environmental data.

**Fields:**
- `id` - UUID (Primary Key)
- `user_id` - References auth.users
- `temperature_celsius` - Body temperature
- `humidity_percent` - Environmental humidity
- `oxygen_level_percent` - Blood oxygen saturation (SpO2)
- `heart_rate_bpm` - Heart rate in beats per minute
- `blood_pressure_systolic/diastolic` - Blood pressure readings
- `blood_sugar_mg_dl` - Blood glucose level
- `weight_kg` - Current weight
- `notes` - Additional notes
- `measurement_source` - manual/device/wearable/hospital
- `device_id` - Measuring device identifier
- `recorded_at` - When measurement was taken
- `created_at` - Timestamp

### 5. Vital Alerts Table
Defines threshold values for vital sign alerts.

**Fields:**
- `id` - UUID (Primary Key)
- `user_id` - References auth.users
- `vital_type` - Type of vital (temperature, oxygen_level, heart_rate, etc.)
- `min_threshold`, `max_threshold` - Alert thresholds
- `is_active` - Whether alert is enabled
- `alert_message` - Custom alert message
- `created_at`, `updated_at` - Timestamps

### 6. Notifications Table
Manages all types of notifications including emergency alerts.

**Fields:**
- `id` - UUID (Primary Key)
- `user_id` - References auth.users
- `title` - Notification title
- `message` - Notification content
- `type` - medication/vital_alert/appointment/emergency/general
- `priority` - low/medium/high/critical
- `is_read` - Whether notification has been read
- `is_emergency` - Whether this is an emergency notification
- `related_medication_id` - References medications (if applicable)
- `related_vital_id` - References vitals (if applicable)
- `scheduled_for` - When to send notification
- `sent_at` - When notification was sent
- `delivery_method` - Array of delivery methods (in_app, email, sms, push)
- `metadata` - Additional JSON data
- `created_at`, `updated_at` - Timestamps

### 7. Emergency Contacts Table
Stores emergency contact information for users.

**Fields:**
- `id` - UUID (Primary Key)
- `user_id` - References auth.users
- `name` - Contact name
- `phone` - Contact phone number
- `email` - Contact email
- `relationship` - Relationship to user
- `is_primary` - Whether this is the primary emergency contact
- `notify_on_emergency` - Send emergency notifications
- `notify_on_medication_missed` - Send medication reminders
- `notify_on_vital_alert` - Send vital sign alerts
- `created_at`, `updated_at` - Timestamps

## Automated Features

### 1. Vital Sign Monitoring
- Automatic alerts when vital signs exceed defined thresholds
- Emergency notifications for critical values
- Configurable alert thresholds per user

### 2. Medication Reminders
- Automatic reminder notifications based on medication schedules
- Tracking of taken/missed medications
- Customizable reminder times

### 3. Emergency Notifications
- Automatic emergency contact notifications for critical vital signs
- Escalation system for missed medications
- Real-time alert system

## Security Features

### Row Level Security (RLS)
All tables have RLS enabled with policies ensuring:
- Users can only access their own data
- Proper authentication is required
- Data isolation between users

### Triggers and Functions
- Automatic vital sign alert checking
- Medication reminder creation
- New user profile initialization
- Timestamp management

## Usage Examples

### Adding a New Medication
```sql
INSERT INTO medications (user_id, name, dosage, frequency, frequency_times, start_date, reminder_times)
VALUES (
  auth.uid(),
  'Aspirin',
  '100mg',
  'once daily',
  1,
  CURRENT_DATE,
  ARRAY['08:00:00']::TIME[]
);
```

### Recording Vital Signs
```sql
INSERT INTO vitals (user_id, temperature_celsius, oxygen_level_percent, heart_rate_bpm)
VALUES (
  auth.uid(),
  36.5,
  98.0,
  72
);
```

### Setting Up Vital Alerts
```sql
INSERT INTO vital_alerts (user_id, vital_type, min_threshold, max_threshold)
VALUES (
  auth.uid(),
  'temperature',
  35.0,
  38.5
);
```

## Migration Instructions

1. Run migrations in order (001 through 005)
2. Ensure Supabase RLS is enabled
3. Test with sample data
4. Configure notification delivery methods as needed

This schema provides a comprehensive foundation for health monitoring, medication management, and emergency response systems.