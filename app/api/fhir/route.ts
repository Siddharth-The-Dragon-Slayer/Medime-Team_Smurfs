import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface FHIRPatient {
  resourceType: 'Patient'
  id: string
  name?: Array<{
    family?: string
    given?: string[]
  }>
  gender?: string
  birthDate?: string
}

interface FHIRCondition {
  resourceType: 'Condition'
  id: string
  code?: {
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
    text?: string
  }
  subject?: {
    reference?: string
  }
  onsetDateTime?: string
}

interface FHIRMedicationRequest {
  resourceType: 'MedicationRequest'
  id: string
  status?: string
  intent?: string
  medicationCodeableConcept?: {
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
    text?: string
  }
  subject?: {
    reference?: string
  }
  authoredOn?: string
}

interface FHIRObservation {
  resourceType: 'Observation'
  id: string
  status?: string
  code?: {
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
    text?: string
  }
  subject?: {
    reference?: string
  }
  effectiveDateTime?: string
  valueQuantity?: {
    value?: number
    unit?: string
  }
  valueString?: string
  component?: Array<{
    code?: {
      text?: string
    }
    valueQuantity?: {
      value?: number
      unit?: string
    }
  }>
}

interface FHIREncounter {
  resourceType: 'Encounter'
  id: string
  status?: string
  class?: {
    code?: string
  }
  subject?: {
    reference?: string
  }
  period?: {
    start?: string
    end?: string
  }
  reasonCode?: Array<{
    text?: string
  }>
}

interface FHIRBundle {
  resourceType: 'Bundle'
  entry?: Array<{
    resource: FHIRPatient | FHIRCondition | FHIRMedicationRequest | FHIRObservation | FHIREncounter
  }>
}

export async function POST(request: NextRequest) {
  try {
    const { fhirId } = await request.json()
    
    if (!fhirId) {
      return NextResponse.json(
        { error: 'FHIR ID is required' },
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

    // Fetch FHIR data
    const fhirUrl = `https://hapi.fhir.org/baseR4/Patient/${fhirId}/$everything`
    
    const fhirResponse = await fetch(fhirUrl)
    
    if (!fhirResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch FHIR data' },
        { status: 400 }
      )
    }

    const fhirData: FHIRBundle = await fhirResponse.json()
    
    if (!fhirData.entry) {
      return NextResponse.json(
        { error: 'No FHIR data found' },
        { status: 404 }
      )
    }

    // Parse FHIR data
    let patientData: Partial<FHIRPatient> = {}
    const conditions: FHIRCondition[] = []
    const medications: FHIRMedicationRequest[] = []
    const observations: FHIRObservation[] = []
    const encounters: FHIREncounter[] = []

    fhirData.entry.forEach(entry => {
      const resource = entry.resource
      
      switch (resource.resourceType) {
        case 'Patient':
          patientData = resource as FHIRPatient
          break
        case 'Condition':
          conditions.push(resource as FHIRCondition)
          break
        case 'MedicationRequest':
          medications.push(resource as FHIRMedicationRequest)
          break
        case 'Observation':
          observations.push(resource as FHIRObservation)
          break
        case 'Encounter':
          encounters.push(resource as FHIREncounter)
          break
      }
    })

    // Extract patient information
    const name = patientData.name?.[0]
    const fullName = name ? `${name.given?.join(' ') || ''} ${name.family || ''}`.trim() : ''
    const gender = patientData.gender
    const birthDate = patientData.birthDate

    // Extract medical conditions
    const medicalConditions = conditions.map(condition => 
      condition.code?.coding?.[0]?.display || condition.code?.text || 'Unknown condition'
    )

    // Extract vital signs and lab results from observations
    const vitalSigns: any[] = []
    const labResults: any[] = []

    observations.forEach(obs => {
      const observationName = obs.code?.text || obs.code?.coding?.[0]?.display || 'Unknown observation'
      const value = obs.valueQuantity?.value
      const unit = obs.valueQuantity?.unit
      const effectiveDate = obs.effectiveDateTime

      const observationData = {
        name: observationName,
        value: value,
        unit: unit,
        date: effectiveDate,
        fhir_observation_id: obs.id
      }

      // Categorize observations
      if (observationName.toLowerCase().includes('hba1c') || 
          observationName.toLowerCase().includes('glucose') ||
          observationName.toLowerCase().includes('cholesterol')) {
        labResults.push(observationData)
      } else if (observationName.toLowerCase().includes('blood pressure') ||
                 observationName.toLowerCase().includes('heart rate') ||
                 observationName.toLowerCase().includes('temperature') ||
                 observationName.toLowerCase().includes('weight') ||
                 observationName.toLowerCase().includes('height')) {
        vitalSigns.push(observationData)
      } else {
        labResults.push(observationData) // Default to lab results
      }
    })

    // Extract encounter information
    const encounterHistory = encounters.map(encounter => ({
      id: encounter.id,
      status: encounter.status,
      type: encounter.class?.code,
      start: encounter.period?.start,
      end: encounter.period?.end,
      reason: encounter.reasonCode?.[0]?.text || 'Unknown reason'
    }))

    // Update user profile with FHIR data
    const profileUpdates: any = {
      fhir_id: fhirId
    }

    if (fullName) profileUpdates.name = fullName
    if (gender) profileUpdates.gender = gender
    if (birthDate) profileUpdates.date_of_birth = birthDate
    if (medicalConditions.length > 0) profileUpdates.medical_conditions = medicalConditions

    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id)

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      )
    }

    // Add medications to database
    for (const medication of medications) {
      if (medication.status === 'active') {
        const medicationName = medication.medicationCodeableConcept?.coding?.[0]?.display || 
                              medication.medicationCodeableConcept?.text || 
                              'Unknown medication'

        const { error: medicationError } = await supabase
          .from('medications')
          .insert({
            user_id: user.id,
            name: medicationName,
            dosage: 'As prescribed',
            frequency: 'As prescribed',
            frequency_times: 1,
            start_date: medication.authoredOn || new Date().toISOString().split('T')[0],
            is_active: true,
            prescribed_by: 'FHIR Import',
            fhir_medication_id: medication.id
          })

        if (medicationError) {
          console.error('Error adding medication:', medicationError)
        }
      }
    }

    // Add vital signs to database
    for (const vital of vitalSigns) {
      if (vital.value && vital.date) {
        const vitalData: any = {
          user_id: user.id,
          recorded_at: vital.date,
          measurement_source: 'fhir_import',
          notes: `Imported from FHIR: ${vital.name}`,
          fhir_observation_id: vital.fhir_observation_id
        }

        // Map specific vital signs to database fields
        const vitalName = vital.name.toLowerCase()
        if (vitalName.includes('temperature')) {
          vitalData.temperature_celsius = vital.value
        } else if (vitalName.includes('heart rate')) {
          vitalData.heart_rate_bpm = vital.value
        } else if (vitalName.includes('weight')) {
          vitalData.weight_kg = vital.value
        } else if (vitalName.includes('blood pressure')) {
          // Handle blood pressure specially if it has systolic/diastolic components
          if (vital.name.includes('systolic')) {
            vitalData.blood_pressure_systolic = vital.value
          } else if (vital.name.includes('diastolic')) {
            vitalData.blood_pressure_diastolic = vital.value
          }
        }

        const { error: vitalError } = await supabase
          .from('vitals')
          .insert(vitalData)

        if (vitalError) {
          console.error('Error adding vital sign:', vitalError)
        }
      }
    }

    return NextResponse.json({
      message: 'FHIR data imported successfully',
      data: {
        patient: {
          name: fullName,
          gender,
          birthDate,
          fhirId
        },
        conditions: medicalConditions,
        medications: medications.filter(m => m.status === 'active').map(m => ({
          name: m.medicationCodeableConcept?.coding?.[0]?.display || 
                m.medicationCodeableConcept?.text || 
                'Unknown medication',
          status: m.status,
          authoredOn: m.authoredOn,
          fhirId: m.id
        })),
        observations: observations.map(obs => ({
          name: obs.code?.text || obs.code?.coding?.[0]?.display || 'Unknown observation',
          value: obs.valueQuantity?.value,
          unit: obs.valueQuantity?.unit,
          date: obs.effectiveDateTime,
          status: obs.status,
          fhirId: obs.id
        })),
        encounters: encounterHistory,
        summary: {
          totalConditions: conditions.length,
          totalMedications: medications.filter(m => m.status === 'active').length,
          totalObservations: observations.length,
          totalEncounters: encounters.length,
          vitalSigns: vitalSigns.length,
          labResults: labResults.length
        }
      }
    })

  } catch (error) {
    console.error('FHIR import error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}