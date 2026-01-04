import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { sendSOSEmail, checkCriticalVitals } from '@/lib/email-service'

async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile for email and name
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
    }

    const { temperature, heartRate } = await request.json()

    // Validate input
    if (typeof temperature !== 'number' || typeof heartRate !== 'number') {
      return NextResponse.json({ error: 'Invalid vital signs data' }, { status: 400 })
    }

    // Check if vitals are critical
    const { isCritical, alertType } = checkCriticalVitals(temperature, heartRate)

    if (!isCritical) {
      return NextResponse.json({ 
        message: 'Vitals are within normal range',
        critical: false 
      })
    }

    // Check if we've already sent an alert recently (prevent spam)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: recentAlerts } = await supabase
      .from('vitals')
      .select('id')
      .eq('user_id', user.id)
      .gte('recorded_at', oneHourAgo)
      .or(`temperature_celsius.gt.38,temperature_celsius.lt.35.5,heart_rate_bpm.gt.120,heart_rate_bpm.lt.50`)

    // If we've sent alerts in the last hour, don't spam
    if (recentAlerts && recentAlerts.length > 3) {
      return NextResponse.json({ 
        message: 'Recent alerts already sent',
        critical: true,
        alertSent: false 
      })
    }

    // Prepare email data
    const emailData = {
      userEmail: profile.email || user.email!,
      userName: profile.name || 'User',
      temperature,
      heartRate,
      timestamp: new Date().toLocaleString(),
      alertType: alertType!
    }

    // Send SOS email
    const emailSent = await sendSOSEmail(emailData)

    if (emailSent) {
      // Log the alert in database
      await supabase
        .from('vitals')
        .insert({
          user_id: user.id,
          temperature_celsius: temperature,
          heart_rate_bpm: heartRate,
          oxygen_level_percent: 98, // Default value
          humidity_percent: 45, // Default value
          measurement_source: 'device',
          device_id: 'sos_alert_system',
          recorded_at: new Date().toISOString(),
          notes: `CRITICAL ALERT: ${alertType} - SOS email sent to ${emailData.userEmail}`
        })

      return NextResponse.json({
        message: 'Critical vitals detected - SOS email sent',
        critical: true,
        alertSent: true,
        alertType
      })
    } else {
      return NextResponse.json({
        message: 'Critical vitals detected but failed to send email',
        critical: true,
        alertSent: false,
        alertType
      }, { status: 500 })
    }

  } catch (error) {
    console.error('SOS Alert API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}