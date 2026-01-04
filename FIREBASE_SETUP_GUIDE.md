# Firebase Push Notifications Setup Guide

## ✅ Implementation Complete!

Firebase Cloud Messaging has been successfully integrated into your MediMe application for medication reminder push notifications.

---

## 📋 What Was Implemented

### Frontend Components
- ✅ `lib/firebase/config.ts` - Firebase initialization and FCM setup
- ✅ `public/firebase-messaging-sw.js` - Service worker for background notifications
- ✅ `hooks/use-push-notifications.ts` - React hook for notification management
- ✅ `components/notification-permission-banner.tsx` - Permission request UI

### Backend Components
- ✅ `lib/firebase/admin.ts` - Firebase Admin SDK for sending notifications
- ✅ `app/api/notifications/subscribe/route.ts` - Save FCM tokens to database
- ✅ `app/api/cron/check-medications/route.ts` - Cron job to check medications

### Database
- ✅ `supabase/migrations/006_fcm_notifications.sql` - FCM tokens table and notification tracking

---

## 🚀 Setup Steps

### Step 1: Run Database Migration

Run the SQL migration in your Supabase dashboard:

```bash
# Navigate to Supabase Dashboard → SQL Editor
# Run the file: supabase/migrations/006_fcm_notifications.sql
```

Or use Supabase CLI:
```bash
supabase db push
```

### Step 2: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **sudinc**
3. Click ⚙️ Settings → Project Settings
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file

### Step 3: Configure Environment Variables

Add these to your `.env` file:

```env
# Supabase Service Role Key (from Supabase Dashboard → Settings → API)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Firebase Admin SDK (from the downloaded JSON file)
FIREBASE_PROJECT_ID=sudinc
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@sudinc.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"

# Cron Job Security (generate a random string)
CRON_SECRET=your-random-secret-key-here
```

**Important:** The `FIREBASE_PRIVATE_KEY` must include the `\n` characters and be wrapped in quotes.

### Step 4: Set Up Cron Job

You need to trigger `/api/cron/check-medications` every 15 minutes.

#### Option A: Vercel Cron (Recommended)

Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-medications",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

#### Option B: External Cron Service

Use a service like [cron-job.org](https://cron-job.org):

1. Create account
2. Add new cron job
3. URL: `https://your-domain.vercel.app/api/cron/check-medications`
4. Schedule: Every 15 minutes
5. Add header: `Authorization: Bearer your-cron-secret`

### Step 5: Deploy

```bash
# Install dependencies (if not already done)
npm install

# Deploy to Vercel
vercel --prod
```

---

## 🧪 Testing

### Test Notification Permission

1. Open your app: `http://localhost:3000/dashboard`
2. You should see a blue banner asking for notification permission
3. Click **"Enable Notifications"**
4. Browser will prompt for permission → Click **Allow**
5. Check browser console - you should see: "FCM Token generated: ..."

### Test Notification Sending

1. **Schedule a medication** for 2 minutes from now:
   - Go to `/scheduler`
   - Add medication (e.g., "Test Med")
   - Set time to 2 minutes from now
   - Select today's day
   - Save

2. **Wait for the cron job** (runs every 15 minutes)
   - Or manually trigger: `GET http://localhost:3000/api/cron/check-medications`
   - Add header: `Authorization: Bearer your-cron-secret`

3. **You should receive a notification**:
   - "💊 Medication Reminder"
   - "Time to take your Test Med (1 tablet)"

### Test Notification Click

1. Click the notification
2. Should open the app to `/scheduler`
3. Click "Mark as Taken" action → Opens scheduler with action

---

## 📱 How It Works

### User Flow

```
1. User schedules medication (e.g., Aspirin at 8:00 AM)
   ↓
2. User enables notifications (FCM token saved to database)
   ↓
3. Cron job runs every 15 minutes
   ↓
4. Checks if medication time has passed (0-15 min window)
   ↓
5. Checks if medication was marked as taken
   ↓
6. If NOT taken → Sends push notification
   ↓
7. User receives notification
   ↓
8. User clicks notification → Opens app
   ↓
9. User marks medication as taken
```

### Notification Timing

- **Scheduled Time**: 08:00 AM
- **Check Window**: 08:00 - 08:15 AM
- **Notification Sent**: Between 08:00 - 08:15 AM (if not taken)
- **Prevents Duplicates**: Won't send again if already sent

---

## 🔧 Troubleshooting

### Issue: No notification received

**Check:**
1. ✅ Notification permission granted in browser
2. ✅ FCM token saved in database (`fcm_tokens` table)
3. ✅ Medication scheduled for today
4. ✅ Current time is within 0-15 min past scheduled time
5. ✅ Medication not marked as taken
6. ✅ Cron job is running
7. ✅ Firebase Admin credentials are correct

**Debug:**
```bash
# Check if token was saved
# In Supabase Dashboard → Table Editor → fcm_tokens

# Manually trigger cron job
curl -X GET https://your-domain.vercel.app/api/cron/check-medications \
  -H "Authorization: Bearer your-cron-secret"
```

### Issue: Service worker not registering

**Check:**
1. ✅ File exists: `public/firebase-messaging-sw.js`
2. ✅ HTTPS enabled (required for service workers)
3. ✅ Browser supports service workers

**Debug:**
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations)
})
```

### Issue: Firebase Admin errors

**Check:**
1. ✅ `FIREBASE_PRIVATE_KEY` includes `\n` characters
2. ✅ Private key is wrapped in quotes in `.env`
3. ✅ `FIREBASE_CLIENT_EMAIL` is correct
4. ✅ Service account has FCM permissions

---

## 🎯 Next Steps

### Enhancements You Can Add

1. **Snooze Functionality**
   - Implement snooze action in service worker
   - Reschedule notification for 10 minutes later

2. **Escalation**
   - Send second notification if still not taken after 30 min
   - Alert caretaker after 1 hour

3. **Notification Settings**
   - Let users customize notification timing
   - Choose notification sound
   - Set quiet hours

4. **Analytics**
   - Track notification delivery rate
   - Monitor medication adherence
   - Generate reports

5. **Multi-Device Support**
   - Sync across devices
   - Stop notifications on all devices when marked as taken

---

## 📊 Database Schema

### fcm_tokens Table
```sql
id              UUID (Primary Key)
user_id         UUID (Foreign Key → auth.users)
token           TEXT (FCM token, unique)
device_type     TEXT ('web', 'android', 'ios')
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### medication_logs Updates
```sql
notification_sent       BOOLEAN (default: false)
notification_sent_at    TIMESTAMP
```

---

## 🔐 Security

- ✅ FCM tokens stored with RLS policies
- ✅ Cron endpoint protected with secret key
- ✅ User can only access their own tokens
- ✅ Firebase Admin SDK uses service account
- ✅ Notifications only sent to authenticated users

---

## 💰 Cost

- **Firebase FCM**: FREE (unlimited notifications)
- **Vercel Cron**: FREE (on Pro plan)
- **Supabase**: Included in free tier

---

## 📚 Resources

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web Push Notifications](https://web.dev/push-notifications-overview/)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

---

## ✨ Success!

Your medication reminder push notification system is now fully implemented! 🎉

Users will receive timely notifications to never miss their medications.
