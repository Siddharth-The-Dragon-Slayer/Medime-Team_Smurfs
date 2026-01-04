"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Pill, RefreshCw, Calendar, Bell, TrendingUp, Clock } from "lucide-react"
import type { MedicationDashboardProps, Medication } from "@/types" // Declare or import MedicationDashboardProps and Medication

export function MedicationDashboard({ user, profile }: MedicationDashboardProps) {
  const [medications, setMedications] = useState<Medication[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const fetchMedications = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setMedications(data || [])
    } catch (err: any) {
      console.error('Error fetching medications:', err)
      setError(err.message || 'Failed to load medications')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMedications()
  }, [user.id])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {profile?.name || "User"}</h1>
        <p className="text-gray-600">Here's your medication overview for today</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="border-green-100">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Pill className="w-5 h-5 text-primary" />
              Active Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">{medications.length}</div>
              <p className="text-sm text-gray-600">Total medications</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-blue-600" />
              Today's Doses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {medications.filter((m) => m.frequency?.toLowerCase().includes("daily")).length}
              </div>
              <p className="text-sm text-gray-600">Due today</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="w-5 h-5 text-orange-600" />
              Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">3</div>
              <p className="text-sm text-gray-600">Active reminders</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Adherence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">92%</div>
              <p className="text-sm text-gray-600">This week</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="border-green-100 bg-green-50/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Schedule Medications</h3>
                <p className="text-sm text-gray-600">Set up your daily medication schedule</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100 bg-blue-50/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Set Reminders</h3>
                <p className="text-sm text-gray-600">Never miss a dose with smart reminders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-100 bg-purple-50/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Health Insights</h3>
                <p className="text-sm text-gray-600">Track your medication adherence</p>
              </div>
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
              onClick={fetchMedications}
              disabled={isLoading}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Refreshing..." : "Refresh"}
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
                You haven't scheduled any medications yet. Click on "Schedule Medications" above to add your first medication.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {medications.map((medication) => (
                <Card key={medication.id} className="border-green-100 bg-green-50/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 text-sm">{medication.name}</h4>
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
                      {medication.instructions && (
                        <div>
                          <span className="text-gray-600">Instructions:</span>
                          <p className="font-medium text-xs">{medication.instructions}</p>
                        </div>
                      )}
                      {medication.reminder_times && medication.reminder_times.length > 0 && (
                        <div>
                          <span className="text-gray-600">Reminder Times:</span>
                          <p className="font-medium text-xs">
                            {medication.reminder_times.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
