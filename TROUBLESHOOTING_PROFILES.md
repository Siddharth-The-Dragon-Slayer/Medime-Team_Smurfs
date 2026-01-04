# Profile Creation Troubleshooting Guide

## Quick Diagnosis

Run these steps in your Supabase SQL Editor to find the issue:

### Step 1: Run Debug Script
Copy and paste `DEBUG_PROFILE_ISSUE.sql` into Supabase SQL Editor and run it. This will show:
- ✅ If the trigger function exists
- ✅ If the trigger is active
- ✅ Recent users and their metadata
- ✅ Current profiles in the table

### Step 2: Check Common Issues

**Issue A: Migration Not Applied**
- If debug shows no trigger function, run `PRODUCTION_MIGRATION.sql` again
- Make sure you're in the correct Supabase project

**Issue B: Trigger Not Firing**
- Check if users appear in `auth.users` but not in `profiles`
- Run `MANUAL_PROFILE_FIX.sql` to create missing profiles

**Issue C: API Route Not Being Used**
- Check browser Network tab during signup
- Should see POST to `/api/auth/signup`
- If not, the form might be using old Supabase client directly

**Issue D: Email Confirmation Required**
- Check if Supabase has email confirmation enabled
- Users might be created but not confirmed
- Check Authentication > Settings > Email Auth

## Step-by-Step Fix

### 1. Verify Migration Applied
```sql
-- Run this in Supabase SQL Editor
SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';
```
Should return: `handle_new_user`

### 2. Check Trigger Exists
```sql
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```
Should return: `on_auth_user_created`

### 3. Test Manual Profile Creation
```sql
-- Replace USER_ID with actual ID from auth.users
INSERT INTO profiles (id, name, email) 
VALUES ('USER_ID_HERE', 'Test User', 'test@example.com');
```

### 4. Create Missing Profiles
If users exist but profiles don't, run `MANUAL_PROFILE_FIX.sql`

## Most Likely Issues

### 1. Email Confirmation Enabled
**Problem**: Supabase requires email confirmation before trigger fires
**Solution**: 
- Go to Authentication > Settings
- Disable "Enable email confirmations" temporarily for testing
- Or check your email and confirm the account

### 2. Trigger Function Error
**Problem**: Function has an error and fails silently
**Solution**: Check Supabase Logs for errors

### 3. RLS Policy Blocking
**Problem**: Row Level Security prevents profile creation
**Solution**: 
```sql
-- Temporarily disable RLS for testing
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- Test signup
-- Then re-enable: ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### 4. Wrong API Endpoint
**Problem**: Form still using old direct Supabase client
**Check**: Browser Network tab should show POST to `/api/auth/signup`

## Quick Test

1. **Create a test user manually**:
```sql
-- In Supabase SQL Editor
INSERT INTO profiles (id, name, email, phone) 
VALUES (gen_random_uuid(), 'Manual Test', 'manual@test.com', '+1234567890');
```

2. **If this works**, the table is fine - issue is with the trigger

3. **If this fails**, there's a table/permission issue

## Emergency Fix

If nothing else works, modify the signup API to create profiles directly:

```typescript
// In app/api/auth/signup/route.ts, after user creation:
if (authData.user) {
  await supabase.from('profiles').insert({
    id: authData.user.id,
    name,
    email,
    phone,
    emergency_contact_name: caretakerName,
    emergency_contact_relationship: relation,
  })
}
```

## Check Results

After any fix, verify:
```sql
SELECT COUNT(*) as users FROM auth.users;
SELECT COUNT(*) as profiles FROM profiles;
-- These numbers should match
```

Run the debug script first, then follow the appropriate fix based on what you find!