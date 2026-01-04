# 🚀 Firebase Push Notifications - Final Setup Checklist

## ✅ Completed Steps

1. ✅ **Firebase packages installed** (`firebase`, `firebase-admin`)
2. ✅ **Firebase credentials added** to `.env`
3. ✅ **Vercel cron configured** (`vercel.json` created)
4. ✅ **All code files created**:
   - Frontend: Firebase config, service worker, hooks, components
   - Backend: Admin SDK, API routes, cron job
   - Database: Migration file ready

---

## 📝 Remaining Steps

### Step 1: Get Supabase Service Role Key

**You need to add this to your `.env` file:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/njwrtrccevbgjgstwxyo/settings/api)
2. Navigate to: **Settings** → **API**
3. Scroll down to **Project API keys**
4. Copy the **`service_role`** key (secret key)
5. Update `.env` file:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qd3J0cmNjZXZiZ2pnc3R3eHlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzQxODM0NSwiZXhwIjoyMDUyOTk0MzQ1fQ.YOUR_SERVICE_ROLE_KEY_HERE
```

⚠️ **Important:** This is a secret key - never commit it to git!

---

### Step 2: Run Database Migration

**Create the FCM tokens table:**

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/njwrtrccevbgjgstwxyo/sql/new)
2. Copy the contents of `supabase/migrations/006_fcm_notifications.sql`
3. Paste and run in SQL Editor
4. Verify table created: Check **Table Editor** → `fcm_tokens`

**Or use Supabase CLI:**
```bash
supabase db push
```

---

### Step 3: Test Locally

```bash
# Start development server
npm run dev

# Open browser
http://localhost:3000/dashboard
```

**Expected behavior:**
1. ✅ Blue notification banner appears
2. ✅ Click "Enable Notifications"
3. ✅ Browser asks for permission → Allow
4. ✅ Console shows: "FCM Token generated: ..."
5. ✅ Token saved to `fcm_tokens` table

---

### Step 4: Test Notification Flow

**Schedule a test medication:**

1. Go to `/scheduler`
2. Add medication:
   - Name: "Test Medicine"
   - Time: **2 minutes from now**
   - Days: Select today
   - Dosage: "1 tablet"
3. Click "Add Schedule"

**Manually trigger cron (for testing):**

```bash
curl -X GET http://localhost:3000/api/cron/check-medications \
  -H "Authorization: Bearer medimi-cron-secret-2026"
```

**Expected result:**
- 📱 Push notification appears
- Title: "💊 Medication Reminder"
- Body: "Time to take your Test Medicine (1 tablet)"

---

### Step 5: Deploy to Vercel

```bash
# Deploy
vercel --prod

# Or push to GitHub (if connected to Vercel)
git add .
git commit -m "Add Firebase push notifications"
git push
```

**After deployment:**

1. Add environment variables in Vercel:
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all variables from `.env`
   - Redeploy

2. Cron will automatically run every 15 minutes (configured in `vercel.json`)

---

## 🧪 Testing Checklist

- [ ] Notification permission banner shows on dashboard
- [ ] Can enable notifications successfully
- [ ] FCM token saved to database
- [ ] Service worker registered
- [ ] Can schedule medication
- [ ] Cron job runs successfully
- [ ] Notification received when medication not taken
- [ ] Clicking notification opens app
- [ ] Marking as taken prevents notification

---

## 🔍 Troubleshooting

### No notification banner?
- Check browser console for errors
- Verify service worker registered: `navigator.serviceWorker.getRegistrations()`

### Notification not received?
1. Check FCM token in database
2. Verify medication scheduled for today
3. Check current time is 0-15 min past scheduled time
4. Run cron manually to test
5. Check browser console and server logs

### Cron not running?
- Verify `vercel.json` deployed
- Check Vercel logs: Dashboard → Deployments → Logs
- Ensure environment variables set in Vercel

---

## 📊 Current Status

✅ **Code**: 100% Complete  
⚠️ **Database**: Needs migration  
⚠️ **Environment**: Needs service role key  
⚠️ **Testing**: Ready to test  
⚠️ **Deployment**: Ready to deploy  

---

## 🎯 Next Actions

1. **Get Supabase service role key** → Update `.env`
2. **Run database migration** → Create `fcm_tokens` table
3. **Test locally** → Verify notifications work
4. **Deploy to Vercel** → Add env vars and deploy

---

## 📚 Documentation

- Full setup guide: `FIREBASE_SETUP_GUIDE.md`
- Implementation plan: `FIREBASE_NOTIFICATIONS_PLAN.md`

---

**You're almost there! Just complete the 2 remaining steps and you'll have working push notifications! 🚀**
