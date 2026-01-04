# Firebase Push Notifications Implementation Plan

## Overview
Implement Firebase Cloud Messaging (FCM) to send push notifications for medication reminders when medicines are not taken at scheduled times.

---

## Architecture

```
Medication Schedule → Cron Job/Cloud Function → Check if Taken → Send FCM Notification
                                                      ↓
                                              User's Browser/Device
```

---

## Prerequisites

### 1. Firebase Project Setup
- Create Firebase project at https://console.firebase.google.com
- Enable Firebase Cloud Messaging (FCM)
- Get Firebase configuration credentials
- Generate a service account key (for server-side)

### 2. Required Packages
```bash
npm install firebase firebase-admin
```

---

## Implementation Steps

### Phase 1: Firebase Setup (Frontend)

#### 1.1 Firebase Configuration
**File:** `lib/firebase/config.ts`
- Initialize Firebase app with credentials
- Configure FCM with VAPID key (for web push)

#### 1.2 FCM Service Worker
**File:** `public/firebase-messaging-sw.js`
- Handle background notifications
- Show notification when app is not in focus
- Handle notification clicks

#### 1.3 Request Permission & Get Token
**File:** `hooks/use-push-notifications.ts`
- Request notification permission from user
- Get FCM registration token
- Save token to database (linked to user)
- Handle token refresh

---

### Phase 2: Backend Setup

#### 2.1 Firebase Admin SDK
**File:** `lib/firebase/admin.ts`
- Initialize Firebase Admin SDK with service account
- Create function to send notifications

#### 2.2 API Routes
**File:** `app/api/notifications/send/route.ts`
- Endpoint to send push notifications
- Validate user and medication data

**File:** `app/api/notifications/subscribe/route.ts`
- Save FCM token to database
- Link token to user account

---

### Phase 3: Database Schema Updates

#### 3.1 New Table: `fcm_tokens`
```sql
CREATE TABLE fcm_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  device_type TEXT, -- 'web', 'android', 'ios'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3.2 Update `medication_logs` Table
Add field to track notification status:
```sql
ALTER TABLE medication_logs ADD COLUMN notification_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE medication_logs ADD COLUMN notification_sent_at TIMESTAMP;
```

---

### Phase 4: Notification Logic

#### 4.1 Scheduled Job (Cron or Cloud Function)
**File:** `app/api/cron/check-medications/route.ts`

**Logic:**
1. Run every 15 minutes
2. Query all medication schedules for current time window
3. Check if medication was taken (from `medication_logs`)
4. If NOT taken and notification not sent:
   - Send push notification
   - Mark notification as sent

#### 4.2 Notification Tracking
**File:** `app/api/medications/log/route.ts`
- When user marks medication as taken
- Update `medication_logs` table
- Cancel pending notifications if any

---

### Phase 5: User Interface

#### 5.1 Notification Permission Prompt
**Component:** `components/notification-permission-banner.tsx`
- Show banner asking for notification permission
- Explain benefits
- Handle permission grant/deny

#### 5.2 Notification Settings
**Page:** `app/settings/notifications/page.tsx`
- Toggle notifications on/off
- Set notification timing (e.g., 5 min before, at time, 10 min after)
- Test notification button

#### 5.3 Medication Tracking UI
**Component:** `components/medication-tracker.tsx`
- Show today's medications
- "Mark as Taken" button
- Show notification status

---

## Notification Flow

### Scenario 1: User Takes Medicine on Time
1. Scheduled time: 08:00 AM
2. User marks as taken at 08:05 AM
3. ✅ No notification sent

### Scenario 2: User Forgets Medicine
1. Scheduled time: 08:00 AM
2. Cron runs at 08:15 AM
3. Checks: Medicine not taken
4. 📱 Sends push notification: "Reminder: Take your Aspirin (1 tablet)"
5. User clicks notification → Opens app → Marks as taken

### Scenario 3: User Still Doesn't Take Medicine
1. Scheduled time: 08:00 AM
2. First notification at 08:15 AM
3. Second notification at 08:30 AM (escalation)
4. Alert caretaker at 09:00 AM (if still not taken)

---

## Environment Variables

Add to `.env`:
```env
# Firebase Web Config
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key

# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key
```

---

## Estimated Timeline

- **Phase 1** (Firebase Setup): 2-3 hours
- **Phase 2** (Backend): 3-4 hours
- **Phase 3** (Database): 1 hour
- **Phase 4** (Notification Logic): 4-5 hours
- **Phase 5** (UI): 2-3 hours
- **Testing & Debugging**: 3-4 hours

**Total**: ~15-20 hours

---

## Resources

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Next.js + FCM Guide](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Service Worker Guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
