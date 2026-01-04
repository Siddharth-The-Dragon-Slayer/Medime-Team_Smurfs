import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { 
      name, 
      email, 
      password, 
      licenseNumber, 
      specialization, 
      hospitalAffiliation, 
      phone 
    } = await request.json()

    const supabase = createClient()

    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: 'doctor',
          name: name
        }
      }
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 400 }
      )
    }

    // Step 2: Create doctor profile manually
    const { data: doctorData, error: doctorError } = await supabase
      .from('doctors')
      .insert({
        auth_id: authData.user.id,
        name,
        email,
        license_number: licenseNumber,
        specialization,
        hospital_affiliation: hospitalAffiliation,
        phone,
        is_verified: false
      })
      .select()
      .single()

    if (doctorError) {
      console.error('Doctor creation error:', doctorError)
      // If doctor creation fails, we should clean up the auth user
      // But for now, let's just return the error
      return NextResponse.json(
        { error: 'Failed to create doctor profile: ' + doctorError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Doctor account created successfully',
      user: authData.user,
      doctor: doctorData
    })

  } catch (error) {
    console.error('Doctor signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}