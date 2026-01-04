import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { patientEmail, relationshipType = 'primary' } = await request.json()
    
    if (!patientEmail) {
      return NextResponse.json(
        { error: 'Patient email is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is a doctor
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('*')
      .eq('auth_id', user.id)
      .single()

    // TEMPORARY: Create a mock doctor if none exists (for testing)
    let doctorData = doctor
    if (doctorError || !doctor) {
      // Create a temporary doctor record for testing
      const { data: newDoctor, error: createError } = await supabase
        .from('doctors')
        .insert({
          auth_id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Test Doctor',
          email: user.email || '',
          license_number: 'TEMP123',
          specialization: 'General Practice',
          hospital_affiliation: 'Test Hospital',
          phone: '+1234567890',
          is_verified: false
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json(
          { error: 'Failed to create doctor profile: ' + createError.message },
          { status: 500 }
        )
      }
      
      doctorData = newDoctor
    }

    // Find patient by email
    const { data: patientUser, error: patientUserError } = await supabase
      .from('profiles')
      .select('id, email, name')
      .eq('email', patientEmail.toLowerCase())
      .single()

    if (patientUserError || !patientUser) {
      return NextResponse.json(
        { error: 'Patient not found. Please ensure the patient has registered on the platform.' },
        { status: 404 }
      )
    }

    // Check if relationship already exists
    const { data: existingRelationship } = await supabase
      .from('doctor_patient_relationships')
      .select('*')
      .eq('doctor_id', doctorData.id)
      .eq('patient_id', patientUser.id)
      .single()

    if (existingRelationship) {
      return NextResponse.json(
        { error: 'Patient is already in your care' },
        { status: 409 }
      )
    }

    // Create doctor-patient relationship
    const { data: relationship, error: relationshipError } = await supabase
      .from('doctor_patient_relationships')
      .insert({
        doctor_id: doctorData.id,
        patient_id: patientUser.id,
        relationship_type: relationshipType,
        created_by: user.id,
        is_active: true
      })
      .select()
      .single()

    if (relationshipError) {
      return NextResponse.json(
        { error: relationshipError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Patient added successfully',
      relationship,
      patient: {
        id: patientUser.id,
        email: patientUser.email,
        name: patientUser.name
      }
    })

  } catch (error) {
    console.error('Add patient error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}