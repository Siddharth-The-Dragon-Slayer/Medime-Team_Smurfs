"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Pill, LogOut, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

interface Profile {
  id: string
  name: string
  email: string
  caretaker_name?: string
  relation?: string
  phone_number?: string
  fhir_id?: string
}

interface Medication {
  id: string
  medication_name: string
  dosage?: string
  frequency?: string
  instructions?: string
}

interface MedicationDashboardProps {
  user: any
  profile: Profile | null
}

export function MedicationDashboard({ user, profile }: MedicationDashboardProps) {
  const [medications, setMedications] = useState<Medication[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const fetchMedicationsFromFHIR = async () => {
    if (!profile?.fhir_id) {
      setError("No FHIR ID found. Please update your profile.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // First, try to get patient info
      const patientResponse = await fetch(`https://hapi.fhir.org/baseR4/Patient?name=${profile.fhir_id}`)
      const patientData = await patientResponse.json()

      if (!patientData.entry || patientData.entry.length === 0) {
        throw new Error("Patient not found with the provided FHIR ID")
      }

      const patientId = patientData.entry[0].resource.id

      // Then get medication requests for this patient
      const medicationResponse = await fetch(`https://r4.smarthealthit.org/MedicationRequest?patient=${patientId}`)
      const medicationData = await medicationResponse.json()

      if (medicationData.entry && medicationData.entry.length > 0) {
        const fetchedMedications = medicationData.entry.map((entry: any) => {
          const resource = entry.resource
          return {
            fhir_medication_id: resource.id,
            medication_name:
              resource.medicationCodeableConcept?.text || resource.medicationReference?.display || "Unknown Medication",
            dosage: resource.dosageInstruction?.[0]?.text || "As prescribed",
            frequency: resource.dosageInstruction?.[0]?.timing?.repeat?.frequency || "Daily",
            instructions: resource.dosageInstruction?.[0]?.patientInstruction || "Take as directed",
          }
        })

        // Save medications to database
        const { error: insertError } = await supabase.from("medications").upsert(
          fetchedMedications.map((med: any) => ({
            ...med,
            user_id: user.id,
          })),
          { onConflict: "fhir_medication_id,user_id" },
        )

        if (insertError) throw insertError

        // Update local state
        setMedications(fetchedMedications)
      } else {
        setError("No medications found for this patient")
      }
    } catch (err) {
      console.error("Error fetching medications:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch medications")
    } finally {
      setIsLoading(false)
    }
  }

  const loadSavedMedications = async () => {
    const { data, error } = await supabase.from("medications").select("*").eq("user_id", user.id)

    if (error) {
      console.error("Error loading medications:", error)
    } else {
      setMedications(data || [])
    }
  }

  useEffect(() => {
    loadSavedMedications()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-green-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-primary">MediGuide</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {profile?.name || user.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-green-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="w-5 h-5 text-primary" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{profile?.name || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{profile?.email || user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{profile?.phone_number || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">FHIR ID</p>
                <p className="font-medium text-xs">{profile?.fhir_id || "Not provided"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="w-5 h-5 text-primary" />
                Caretaker Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Caretaker Name</p>
                <p className="font-medium">{profile?.caretaker_name || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Relation</p>
                <p className="font-medium">{profile?.relation || "Not provided"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Pill className="w-5 h-5 text-primary" />
                Medication Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{medications.length}</div>
                <p className="text-sm text-gray-600">Active Medications</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medications Section */}
        <Card className="border-green-100">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" />
                Your Medications
              </CardTitle>
              <Button
                onClick={fetchMedicationsFromFHIR}
                disabled={isLoading || !profile?.fhir_id}
                className="bg-primary hover:bg-primary/90"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Fetching..." : "Fetch from FHIR"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {medications.length === 0 ? (
              <div className="text-center py-12">
                <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No medications found</h3>
                <p className="text-gray-600 mb-4">
                  {profile?.fhir_id
                    ? "Click 'Fetch from FHIR' to load your medications from your healthcare provider."
                    : "Please update your profile with a valid FHIR ID to fetch your medications."}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {medications.map((medication) => (
                  <Card key={medication.id} className="border-green-100 bg-green-50/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 text-sm">{medication.medication_name}</h4>
                        <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                          Active
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Dosage:</span>
                          <p className="font-medium">{medication.dosage}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Frequency:</span>
                          <p className="font-medium">{medication.frequency}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Instructions:</span>
                          <p className="font-medium text-xs">{medication.instructions}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
