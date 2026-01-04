import { NextRequest, NextResponse } from 'next/server'
import { sendSOSEmail, checkCriticalVitals } from '@/lib/email-service'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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
    console.log('🧪 Testing SOS Email System...')
    
    // Check environment variables
    const gmailUser = process.env.GMAIL_USER
    const gmailPassword = process.env.GMAIL_APP_PASSWORD
    
    console.log('📧 Gmail User:', gmailUser)
    console.log('🔑 Gmail Password configured:', gmailPassword ? 'Yes' : 'No')
    
    if (!gmailUser || gmailUser === 'your-email@gmail.com') {
      return NextResponse.json({
        error: 'Gmail credentials not configured',
        message: 'Please update GMAIL_USER in .env.local with your actual Gmail address'
      }, { status: 400 })
    }
    
    if (!gmailPassword || gmailPassword === 'your-app-password') {
      return NextResponse.json({
        error: 'Gmail app password not configured',
        message: 'Please update GMAIL_APP_PASSWORD in .env.local with your Gmail app password'
      }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
    }

    // Test with critical values
    const testTemperature = 39.5 // Critical high temperature
    const testHeartRate = 130    // Critical high heart rate
    
    console.log('🌡️ Test Temperature:', testTemperature)
    console.log('💓 Test Heart Rate:', testHeartRate)
    
    // Check if values are critical
    const { isCritical, alertType } = checkCriticalVitals(testTemperature, testHeartRate)
    
    console.log('🚨 Is Critical:', isCritical)
    console.log('⚠️ Alert Type:', alertType)
    
    if (!isCritical) {
      return NextResponse.json({
        error: 'Test values are not critical',
        temperature: testTemperature,
        heartRate: testHeartRate
      }, { status: 400 })
    }

    // Prepare test email data
    const emailData = {
      userEmail: profile.email || user.email!,
      userName: profile.name || 'Test User',
      temperature: testTemperature,
      heartRate: testHeartRate,
      timestamp: new Date().toLocaleString(),
      alertType: alertType!
    }
    
    console.log('📨 Sending test email to:', emailData.userEmail)
    
    // Send test SOS email
    const emailSent = await sendSOSEmail(emailData)
    
    if (emailSent) {
      console.log('✅ Test email sent successfully!')
      return NextResponse.json({
        success: true,
        message: 'Test SOS email sent successfully',
        emailData: {
          recipient: emailData.userEmail,
          temperature: testTemperature,
          heartRate: testHeartRate,
          alertType
        }
      })
    } else {
      console.log('❌ Test email failed to send')
      return NextResponse.json({
        success: false,
        message: 'Test email failed to send',
        error: 'Check server logs for details'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('🚨 Test SOS API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}