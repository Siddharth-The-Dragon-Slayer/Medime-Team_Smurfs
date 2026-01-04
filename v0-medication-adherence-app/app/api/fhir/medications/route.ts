import { type NextRequest, NextResponse } from "next/server"

interface FHIRMedicationRequest {
  id: string
  resourceType: string
  status: string
  medicationCodeableConcept?: {
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
    text?: string
  }
  dosageInstruction?: Array<{
    text?: string
    timing?: {
      repeat?: {
        frequency?: number
        period?: number
        periodUnit?: string
      }
    }
    doseAndRate?: Array<{
      doseQuantity?: {
        value?: number
        unit?: string
      }
    }>
  }>
}

interface FHIRBundle {
  resourceType: string
  entry?: Array<{
    resource: FHIRMedicationRequest
  }>
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patient")

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 })
    }

    // Fetch medication requests from FHIR API
    const fhirUrl = `https://r4.smarthealthit.org/MedicationRequest?patient=${patientId}`

    console.log("[v0] Fetching FHIR data from:", fhirUrl)

    const response = await fetch(fhirUrl, {
      headers: {
        Accept: "application/fhir+json",
        "Content-Type": "application/fhir+json",
      },
    })

    if (!response.ok) {
      console.log("[v0] FHIR API error:", response.status, response.statusText)
      throw new Error(`FHIR API error: ${response.status}`)
    }

    const fhirData: FHIRBundle = await response.json()
    console.log("[v0] FHIR response received, entries:", fhirData.entry?.length || 0)

    // Extract medication information
    const medications =
      fhirData.entry?.map((entry) => {
        const resource = entry.resource

        // Extract medication name from medicationCodeableConcept
        let medicationName = "Unknown Medication"
        if (resource.medicationCodeableConcept) {
          if (resource.medicationCodeableConcept.text) {
            medicationName = resource.medicationCodeableConcept.text
          } else if (resource.medicationCodeableConcept.coding?.[0]?.display) {
            medicationName = resource.medicationCodeableConcept.coding[0].display
          }
        }

        // Extract dosage information
        let dosage = ""
        let frequency = ""
        let instructions = ""

        if (resource.dosageInstruction?.[0]) {
          const dosageInstr = resource.dosageInstruction[0]

          if (dosageInstr.text) {
            instructions = dosageInstr.text
          }

          if (dosageInstr.doseAndRate?.[0]?.doseQuantity) {
            const dose = dosageInstr.doseAndRate[0].doseQuantity
            dosage = `${dose.value || ""} ${dose.unit || ""}`.trim()
          }

          if (dosageInstr.timing?.repeat) {
            const repeat = dosageInstr.timing.repeat
            if (repeat.frequency && repeat.period && repeat.periodUnit) {
              frequency = `${repeat.frequency} time(s) per ${repeat.period} ${repeat.periodUnit}(s)`
            }
          }
        }

        console.log("[v0] Processed medication:", {
          id: resource.id,
          name: medicationName,
          status: resource.status,
        })

        return {
          id: resource.id,
          name: medicationName,
          dosage: dosage || undefined,
          frequency: frequency || undefined,
          instructions: instructions || undefined,
          status: resource.status || "unknown",
        }
      }) || []

    console.log("[v0] Returning", medications.length, "medications")

    return NextResponse.json({
      success: true,
      medications,
      total: medications.length,
    })
  } catch (error) {
    console.error("[v0] Error fetching FHIR medications:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch medications",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
