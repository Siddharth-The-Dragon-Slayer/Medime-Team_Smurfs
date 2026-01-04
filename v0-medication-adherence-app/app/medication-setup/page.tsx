"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Loader2, CheckCircle, AlertCircle, Pill } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Medication {
  id: string
  name: string
  dosage?: string
  frequency?: string
  instructions?: string
  status: string
}

export default function MedicationSetupPage() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUserAndMedications = async () => {
      const supabase = createClient()

      try {
        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          router.push("/auth/login")
          return
        }

        setUser(user)

        // Get FHIR ID from user metadata
        const fhirId = user.user_metadata?.fhir_id

        if (!fhirId) {
          setError("FHIR ID not found. Please contact support.")
          setIsLoading(false)
          return
        }

        // Fetch medications from FHIR API
        const response = await fetch(`/api/fhir/medications?patient=${fhirId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch medications")
        }

        const data = await response.json()
        setMedications(data.medications || [])
      } catch (err) {
        console.error("Error fetching medications:", err)
        setError(err instanceof Error ? err.message : "Failed to load medications")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAndMedications()
  }, [router])

  const handleContinue = () => {
    router.push("/dashboard")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50">
        <Card className="w-full max-w-md border-green-100 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-primary">MediGuide</span>
            </div>
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Loading Your Medications</h2>
            <p className="text-gray-600 text-center">
              We're securely fetching your medication information from your healthcare provider...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 p-6">
        <Card className="w-full max-w-md border-red-100 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-red-700">Error Loading Medications</h2>
            <p className="text-gray-600 text-center mb-6">{error}</p>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-primary">MediGuide</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h1 className="text-3xl font-bold text-gray-900">Medications Loaded Successfully!</h1>
          </div>
          <p className="text-gray-600">
            We've found {medications.length} medication{medications.length !== 1 ? "s" : ""} in your healthcare record
          </p>
        </div>

        {medications.length > 0 ? (
          <div className="grid gap-4 mb-8">
            {medications.map((medication) => (
              <Card key={medication.id} className="border-green-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Pill className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{medication.name}</CardTitle>
                        {medication.dosage && (
                          <CardDescription className="text-sm text-gray-600">{medication.dosage}</CardDescription>
                        )}
                      </div>
                    </div>
                    <Badge variant={medication.status === "active" ? "default" : "secondary"}>
                      {medication.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {medication.frequency && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Frequency:</span>
                        <span className="text-sm text-gray-600">{medication.frequency}</span>
                      </div>
                    )}
                    {medication.instructions && (
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-medium text-gray-700">Instructions:</span>
                        <span className="text-sm text-gray-600">{medication.instructions}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-yellow-100 shadow-sm mb-8">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Medications Found</h3>
              <p className="text-gray-600 text-center">
                We couldn't find any medications in your healthcare record. You can add them manually in your dashboard.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <Button onClick={handleContinue} size="lg" className="bg-primary hover:bg-primary/90">
            Continue to Dashboard
          </Button>
          <p className="text-sm text-gray-500 mt-4">You can always sync more medications later from your dashboard</p>
        </div>
      </div>
    </div>
  )
}
