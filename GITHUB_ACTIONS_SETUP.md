# GitHub Actions Cron Job Setup Guide

## ✅ What Was Created

A GitHub Actions workflow file that will automatically run every 15 minutes to check medications and send notifications.

**File:** `.github/workflows/medication-cron.yml`

---

## 🚀 Setup Steps

### Step 1: Push Code to GitHub

If you haven't already, initialize git and push to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Add Firebase push notifications with GitHub Actions cron"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main
```

---

### Step 2: Add GitHub Secrets

You need to add 2 secrets to your GitHub repository:

#### **2.1 Go to GitHub Repository Settings**

1. Open your repository on GitHub
2. Click **Settings** (top menu)
3. In left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

#### **2.2 Add CRON_SECRET**

- **Name:** `CRON_SECRET`
- **Value:** `medimi-cron-secret-2026`
- Click **Add secret**

#### **2.3 Add APP_URL**

- **Name:** `APP_URL`
- **Value:** Your deployed app URL (e.g., `https://your-app.vercel.app`)
- Click **Add secret**

**Important:** Don't include trailing slash in APP_URL

---

### Step 3: Enable GitHub Actions

GitHub Actions should be enabled by default, but verify:

1. Go to your repository
2. Click **Actions** tab (top menu)
3. If you see a message about enabling workflows, click **Enable**
4. You should see your workflow: "Medication Check Cron Job"

---

### Step 4: Test the Workflow

Before waiting for the scheduled run, test it manually:

1. Go to **Actions** tab
2. Click **Medication Check Cron Job** (left sidebar)
3. Click **Run workflow** button (right side)
4. Click green **Run workflow** button
5. Wait a few seconds, then refresh
6. Click on the running workflow to see logs

**Expected output:**
```
Checking medications at [timestamp]
HTTP Status: 200
Response: {"message":"Medication check completed","schedulesChecked":X,"notificationsSent":Y}
Medication check completed successfully
```

---

### Step 5: Verify Scheduled Runs

The cron job will now run automatically every 15 minutes!

**To check runs:**
1. Go to **Actions** tab
2. You'll see a new run every 15 minutes
3. Click any run to see detailed logs

---

## 📊 Cron Schedule Explained

```yaml
cron: '*/15 * * * *'
```

This means:
- `*/15` - Every 15 minutes
- `*` - Every hour
- `*` - Every day
- `*` - Every month
- `*` - Every day of week

**When it runs:**
- 00:00, 00:15, 00:30, 00:45
- 01:00, 01:15, 01:30, 01:45
- ... and so on

---

## 🔧 Customizing the Schedule

Want to change how often it runs? Edit `.github/workflows/medication-cron.yml`:

```yaml
# Every 5 minutes
cron: '*/5 * * * *'

# Every 30 minutes
cron: '*/30 * * * *'

# Every hour
cron: '0 * * * *'

# Every 2 hours
cron: '0 */2 * * *'

# Only during daytime (8 AM - 8 PM, every 15 min)
cron: '*/15 8-20 * * *'
```

After changing, commit and push:
```bash
git add .github/workflows/medication-cron.yml
git commit -m "Update cron schedule"
git push
```

---

## 🐛 Troubleshooting

### Workflow not running?

**Check:**
1. ✅ GitHub Actions enabled in repository settings
2. ✅ Workflow file in correct location: `.github/workflows/medication-cron.yml`
3. ✅ File pushed to GitHub (check on GitHub website)
4. ✅ No syntax errors in YAML file

**Note:** GitHub Actions can have a delay of up to 5-10 minutes for scheduled runs.

### Getting 401 Unauthorized?

**Check:**
1. ✅ `CRON_SECRET` secret added correctly
2. ✅ Secret value matches what's in your `.env` file
3. ✅ No extra spaces in secret value

### Getting 404 Not Found?

**Check:**
1. ✅ `APP_URL` secret is correct
2. ✅ No trailing slash in APP_URL
3. ✅ App is deployed and accessible
4. ✅ API route exists: `/api/cron/check-medications`

### Workflow fails with error?

**Check logs:**
1. Go to Actions tab
2. Click failed workflow
3. Click "check-medications" job
4. Expand "Check medications and send notifications"
5. Read error message

---

## 📈 Monitoring

### View All Runs

1. Go to **Actions** tab
2. Click **Medication Check Cron Job**
3. See list of all runs with status (✅ success, ❌ failed)

### View Specific Run Details

1. Click any run
2. See:
   - When it ran
   - How long it took
   - Full logs
   - HTTP response from your API

### Email Notifications

GitHub will email you if a workflow fails (by default).

**To customize:**
1. Go to your GitHub profile → Settings
2. Notifications → Actions
3. Choose notification preferences

---

## 🔐 Security Best Practices

✅ **Never commit secrets** - Always use GitHub Secrets  
✅ **Use HTTPS** - Your APP_URL should use HTTPS  
✅ **Rotate secrets** - Change CRON_SECRET periodically  
✅ **Monitor logs** - Check for unauthorized access attempts  
✅ **Limit permissions** - Workflow only has read access to repo  

---

## 💡 Advanced Features

### Add Slack/Discord Notifications

Add this step to notify you when medications are checked:

```yaml
- name: Notify Slack
  if: success()
  run: |
    curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
      -H 'Content-Type: application/json' \
      -d '{"text":"Medication check completed: ${{ steps.check.outputs.result }}"}'
```

### Run on Multiple Schedules

```yaml
on:
  schedule:
    - cron: '*/15 8-20 * * *'  # Every 15 min during day
    - cron: '0 */2 20-8 * * *'  # Every 2 hours at night
```

### Add Retry Logic

```yaml
- name: Check medications with retry
  uses: nick-invision/retry@v2
  with:
    timeout_minutes: 5
    max_attempts: 3
    command: |
      curl -X GET \
        -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
        ${{ secrets.APP_URL }}/api/cron/check-medications
```

---

## 📝 Summary

✅ **Created:** `.github/workflows/medication-cron.yml`  
✅ **Runs:** Every 15 minutes automatically  
✅ **Free:** GitHub Actions is free for public repos  
✅ **Reliable:** GitHub's infrastructure  
✅ **Monitored:** Full logs and email notifications  

---

## 🎯 Next Steps

1. ✅ Push code to GitHub
2. ✅ Add GitHub Secrets (CRON_SECRET, APP_URL)
3. ✅ Test workflow manually
4. ✅ Deploy your app to Vercel/other host
5. ✅ Update APP_URL secret with deployed URL
6. ✅ Monitor first few runs

---

**Your cron job is now set up and will run automatically! 🎉**

Check the Actions tab to see it in action every 15 minutes.
