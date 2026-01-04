# Profile Creation Setup Guide

This guide explains how the user registration data from your form is stored in the Supabase database.

## What I've Implemented

### 1. Database Migration (009_create_profile_trigger.sql)
- **Automatic Profile Creation**: When a user signs up, a database trigger automatically creates a profile record
- **Profile Update Function**: A secure function to update user profiles with validation
- **Data Mapping**: Maps form data to the correct database columns

### 2. API Routes
- **POST /api/auth/signup**: Handles user registration and profile creation
- **GET /api/profile**: Fetches user profile data
- **PUT /api/profile**: Updates user profile information

### 3. Updated Sign-up Form
- **Enhanced Error Handling**: Better error messages and validation
- **API Integration**: Uses the new API routes instead of direct Supabase calls
- **Automatic Redirect**: Redirects to dashboard after successful signup

### 4. Profile Hook (useProfile.ts)
- **Profile Management**: Easy-to-use hook for fetching and updating profiles
- **Type Safety**: Full TypeScript support with proper interfaces
- **Error Handling**: Comprehensive error handling and loading states

## Form Data Mapping

Your form data maps to the database as follows:

| Form Field | Database Column | Notes |
|------------|----------------|-------|
| Full Name | `profiles.name` | Required field |
| Email | `profiles.email` | Required, unique |
| Password | `auth.users` | Handled by Supabase Auth |
| Phone Number | `profiles.phone` | Required for SMS notifications |
| Caretaker Name | `profiles.emergency_contact_name` | Optional |
| Relation | `profiles.emergency_contact_relationship` | Optional |
| FHIR ID | `auth.users.raw_user_meta_data` | Stored in metadata |

## How to Test

### 1. Start Local Development
```bash
# Make sure Docker Desktop is running
npx supabase start
npx supabase db reset  # This applies all migrations
npm run dev
```

### 2. Test the Registration Flow
1. Navigate to `/auth/sign-up`
2. Fill out the form with test data:
   - Name: "John Doe"
   - Email: "test@example.com"
   - Password: "password123"
   - Phone: "+1 (555) 123-4567"
   - Caretaker: "Jane Doe"
   - Relation: "Spouse"
   - FHIR ID: "test-fhir-123"

### 3. Verify Data Storage
After successful registration, check:
- User created in `auth.users` table
- Profile created in `profiles` table with correct data mapping
- User redirected to dashboard

## Database Schema

The `profiles` table structure:
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  blood_type TEXT,
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  medical_conditions TEXT[],
  allergies TEXT[],
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Secure Functions**: Database functions run with SECURITY DEFINER
- **Authentication Required**: All profile operations require valid authentication
- **Input Validation**: Proper validation on both client and server side

## Next Steps

1. **Start Docker Desktop** and run the Supabase local development environment
2. **Apply Migrations** using `npx supabase db reset`
3. **Test Registration** using the updated sign-up form
4. **Verify Data** in the Supabase dashboard

The system is now ready to store all your form data securely in the database with proper user isolation and validation!