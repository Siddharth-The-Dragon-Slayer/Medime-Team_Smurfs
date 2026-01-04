# Production Deployment Guide

## Step 1: Apply Database Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `njwrtrccevbgjgstwxyo`
3. Navigate to **SQL Editor**
4. Copy and paste the contents of `PRODUCTION_MIGRATION.sql`
5. Click **Run** to execute the migration

This will:
- Create the automatic profile creation trigger
- Add the profile update function
- Set up proper permissions and indexes

## Step 2: Deploy Your Application

### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy from your project directory
cd medime/v0-medime
vercel

# Follow the prompts and add your environment variables:
# NEXT_PUBLIC_SUPABASE_URL=https://njwrtrccevbgjgstwxyo.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Option B: Netlify
1. Connect your GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables in Netlify dashboard

### Option C: Other Platforms
- Build command: `npm run build`
- Start command: `npm start`
- Node version: 18+

## Step 3: Test the Complete Flow

### Registration Test
1. Go to your deployed app `/auth/sign-up`
2. Fill out the form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
   - Phone: "+1234567890"
   - Caretaker: "Emergency Contact"
   - Relation: "Family"
   - FHIR ID: "test-123"

3. Submit the form
4. Check Supabase dashboard:
   - **Authentication > Users**: New user should appear
   - **Table Editor > profiles**: Profile should be created with form data

### Login Test
1. Go to `/auth/login`
2. Use the same email/password from registration
3. Should redirect to `/dashboard`

## Step 4: Verify Database

In Supabase Dashboard > Table Editor > profiles, you should see:
- `id`: User UUID (matches auth.users.id)
- `name`: "Test User"
- `email`: "test@example.com"
- `phone`: "+1234567890"
- `emergency_contact_name`: "Emergency Contact"
- `emergency_contact_relationship`: "Family"

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=https://njwrtrccevbgjgstwxyo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Security Notes

- ✅ Row Level Security (RLS) is enabled
- ✅ Users can only access their own data
- ✅ Secure database functions with proper permissions
- ✅ Password hashing handled by Supabase Auth
- ✅ Input validation on both client and server

## Troubleshooting

### If signup fails:
1. Check browser console for errors
2. Verify environment variables are set
3. Check Supabase logs in dashboard

### If profile isn't created:
1. Check if migration was applied successfully
2. Look at Supabase logs for trigger errors
3. Verify RLS policies are correct

### If login fails:
1. Confirm user exists in Authentication > Users
2. Try password reset if needed
3. Check for email confirmation requirements

## What Happens During Signup

1. **Frontend**: Form submits to `/api/auth/signup`
2. **API**: Creates user in Supabase Auth with metadata
3. **Database Trigger**: Automatically creates profile record
4. **Response**: User gets redirected to dashboard
5. **Login**: Standard Supabase Auth handles authentication

Your app is now ready for production with full user registration and login functionality!