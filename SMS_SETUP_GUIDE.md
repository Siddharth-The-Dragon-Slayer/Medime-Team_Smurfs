# SMS Medication Reminders Setup Guide

This guide will help you set up SMS medication reminders for your MediMe application using Twilio and Supabase Edge Functions.

## 📋 Prerequisites

1. **Supabase Project** - Your existing MediMe project
2. **Twilio Account** - For sending SMS messages
3. **Supabase CLI** - For deploying Edge Functions

## 🚀 Step 1: Set Up Twilio

### 1.1 Create Twilio Account
1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a free account
3. Verify your phone number

### 1.2 Get Twilio Credentials
1. In Twilio Console, go to **Account → API keys & tokens**
2. Note down:
   - **Account SID**
   - **Auth Token**
3. Go to **Phone Numbers → Manage → Active numbers**
4. Get a Twilio phone number (free trial includes one)
5. Note down your **Twilio Phone Number**

## 🔧 Step 2: Configure Supabase

### 2.1 Run Database Migrations
Execute these SQL files in your Supabase SQL Editor:
```sql
-- Run 007_create_medication_reminders.sql
-- Run 008_create_sms_logs.sql
```

### 2.2 Set Environment Variables
In your Supabase project dashboard:
1. Go to **Settings → Edge Functions**
2. Add these environment variables:
   - `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
   - `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token
   - `TWILIO_PHONE_NUMBER`: Your Twilio phone number (e.g., +1234567890)

## 📱 Step 3: Deploy Edge Functions

### 3.1 Install Supabase CLI
```bash
npm install -g supabase
```

### 3.2 Login to Supabase
```bash
supabase login
```

### 3.3 Link Your Project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### 3.4 Deploy Functions
```bash
# Deploy SMS sending function
supabase functions deploy send-medication-sms

# Deploy reminder scheduler function
supabase functions deploy schedule-medication-reminders
```

## ⏰ Step 4: Set Up Automated Scheduling

### 4.1 Using Supabase Cron (Recommended)
Create a cron job in Supabase:

```sql
-- Create a cron job that runs every minute
SELECT cron.schedule(
  'medication-reminders',
  '* * * * *', -- Every minute
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/schedule-medication-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
    ),
    body := jsonb_build_object()
  );
  $$
);
```

### 4.2 Alternative: External Cron Service
You can use services like:
- **Cron-job.org**
- **EasyCron**
- **GitHub Actions**

Set them to call:
```
POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/schedule-medication-reminders
Authorization: Bearer YOUR_SERVICE_ROLE_KEY
```

## 🎯 Step 5: Update Your Application

### 5.1 Add SMS Settings to Reminders Page
```typescript
// In your reminders page
import { SMSSettings } from "@/components/sms-settings"

// Add SMS settings component
<SMSSettings user={data.user} />
```

### 5.2 Update Reminder Settings Component
Add SMS toggle to individual reminders:

```typescript
// Add SMS enabled field to reminder interface
interface ReminderSetting {
  // ... existing fields
  smsEnabled: boolean
}

// Add SMS toggle in the UI
<div className="flex items-center justify-between">
  <Label htmlFor={`sms-${reminder.id}`} className="text-sm">
    SMS Notifications
  </Label>
  <Switch
    id={`sms-${reminder.id}`}
    checked={reminder.smsEnabled}
    onCheckedChange={(checked) => updateReminderSetting(reminder.id, "smsEnabled", checked)}
  />
</div>
```

## 📊 Step 6: Testing

### 6.1 Test SMS Function
```bash
# Test the SMS function directly
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-medication-sms' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "+1234567890",
    "message": "Test SMS from MediMe!"
  }'
```

### 6.2 Test Reminder Scheduler
```bash
# Test the reminder scheduler
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/schedule-medication-reminders' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json'
```

## 💰 Cost Considerations

### Twilio Pricing (as of 2024):
- **SMS**: ~$0.0075 per message in the US
- **Phone Number**: ~$1/month
- **Free Trial**: $15 credit

### Example Monthly Costs:
- **100 SMS/month**: ~$0.75
- **500 SMS/month**: ~$3.75
- **1000 SMS/month**: ~$7.50
- Plus $1/month for phone number

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit Twilio credentials to code
2. **Rate Limiting**: Implement rate limiting to prevent SMS spam
3. **User Consent**: Always get user consent before sending SMS
4. **Opt-out**: Provide easy opt-out mechanism (STOP keyword)
5. **Validation**: Validate phone numbers before sending

## 🚨 Troubleshooting

### Common Issues:

1. **SMS Not Sending**
   - Check Twilio credentials
   - Verify phone number format (+1234567890)
   - Check Twilio account balance

2. **Function Errors**
   - Check Supabase function logs
   - Verify environment variables
   - Test with curl commands

3. **Cron Not Working**
   - Verify cron job is created
   - Check service role key permissions
   - Monitor function execution logs

## 📱 SMS Message Examples

The system sends messages like:
```
🏥 MediMe Reminder: Time to take your Aspirin 100mg.

Don't forget to take your medication as prescribed.

Reply STOP to unsubscribe.
```

## 🎉 Features Included

✅ **Automatic SMS reminders** at scheduled times
✅ **Test SMS functionality** for verification
✅ **SMS history tracking** with delivery status
✅ **Phone number validation** and formatting
✅ **Opt-out support** (STOP keyword)
✅ **Error handling** and logging
✅ **Cost-effective** Twilio integration
✅ **HIPAA-compliant** message content

Your SMS medication reminder system is now ready! Users can receive timely SMS notifications for their medications, helping improve medication adherence and health outcomes.