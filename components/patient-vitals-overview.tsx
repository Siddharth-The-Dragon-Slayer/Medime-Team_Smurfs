"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createBrowserClient } from "@supabase/ssr"
import { Heart, Thermometer, Activity, Droplets, Search, Users, AlertTriangle, TrendingUp, Calendar } from "lucide-react"
import { AddPatientDialog } from "@/components/add-patient-dialog"

interface Doctor {
  id: string
  name: string
  email: string
  specialization: string
  hospital_affiliation: string
}

interface PatientRelationship {
  id: string
  patient_id: string
  relationship_type: string
  patient: {
    id: string
    email: string
    user_metadata: any
  }
}

interface PatientVital {
  id: string
  user_id: string
  temperature_celsius: number | null
  heart_rate_bpm: number | null
  blood_pressure_systolic: number | null
  blood_pressure_diastolic: number | null
  oxygen_level_percent: number | null
  blood_sugar_mg_dl: number | null
  recorded_at: string
  measurement_source: string
  notes: string | null
}

interface PatientProfile {
  id: string
  name: string
  email: string
  phone: string | null
  date_of_birth: string | null
  gender: string | null
  medical_conditions: string[] | null
}

interface PatientVitalsOverviewProps {
  doctor: Doctor
  patientRelationships: PatientRelationship[]
}

export function PatientVitalsOverview({ doctor, patientRelationships }: PatientVitalsOverviewProps) {
  const [patients, setPatients] = useState<PatientProfile[]>([])
  const [patientVitals, setPatientVitals] = useState<Record<string, PatientVital[]>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    // For demo purposes, let's create some mock patient data
    const mockPatients: PatientProfile[] = [
      {
        id: "patient-1",
        name: "John Doe",
        email: "john.doe@email.com",
        phone: "+1234567890",
        date_of_birth: "1985-06-15",
        gender: "male",
        medical_conditions: ["Hypertension", "Diabetes Type 2"]
      },
      {
        id: "patient-2", 
        name: "Jane Smith",
        email: "jane.smith@email.com",
        phone: "+1234567891",
        date_of_birth: "1990-03-22",
        gender: "female",
        medical_conditions: ["Asthma"]
      }
    ]

    const mockVitals: Record<string, PatientVital[]> = {
      "patient-1": [
        {
          id: "vital-1",
          user_id: "patient-1",
          temperature_celsius: 37.2,
          heart_rate_bpm: 85,
          blood_pressure_systolic: 140,
          blood_pressure_diastolic: 90,
          oxygen_level_percent: 98,
          blood_sugar_mg_dl: 180,
          recorded_at: new Date().toISOString(),
          measurement_source: "manual",
          notes: "Patient feeling well"
        }
      ],
      "patient-2": [
        {
          id: "vital-2",
          user_id: "patient-2",
          temperature_celsius: 36.8,
          heart_rate_bpm: 72,
          blood_pressure_systolic: 120,
          blood_pressure_diastolic: 80,
          oxygen_level_percent: 99,
          blood_sugar_mg_dl: null,
          recorded_at: new Date().toISOString(),
          measurement_source: "device",
          notes: null
        }
      ]
    }

    setPatients(mockPatients)
    setPatientVitals(mockVitals)
    setIsLoading(false)
  }, [])

  const loadPatientsAndVitals = async () => {
    setIsLoading(true)
    
    try {
      // Get patient profiles
      const patientIds = patientRelationships.map(rel => rel.patient_id)
      
      if (patientIds.length === 0) {
        setIsLoading(false)
        return
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', patientIds)

      if (profilesError) {
        console.error('Error loading patient profiles:', profilesError)
        setIsLoading(false)
        return
      }

      setPatients(profiles || [])

      // Get recent vitals for each patient (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: vitals, error: vitalsError } = await supabase
        .from('vitals')
        .select('*')
        .in('user_id', patientIds)
        .gte('recorded_at', sevenDaysAgo.toISOString())
        .order('recorded_at', { ascending: false })

      if (vitalsError) {
        console.error('Error loading patient vitals:', vitalsError)
      } else {
        // Group vitals by patient
        const vitalsByPatient: Record<string, PatientVital[]> = {}
        vitals?.forEach(vital => {
          if (!vitalsByPatient[vital.user_id]) {
            vitalsByPatient[vital.user_id] = []
          }
          vitalsByPatient[vital.user_id].push(vital)
        })
        setPatientVitals(vitalsByPatient)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getLatestVital = (patientId: string): PatientVital | null => {
    const vitals = patientVitals[patientId]
    return vitals && vitals.length > 0 ? vitals[0] : null
  }

  const getVitalStatus = (vital: PatientVital | null) => {
    if (!vital) return { status: 'no-data', color: 'gray' }

    const alerts = []
    
    // Check temperature (normal: 36.1-37.2°C)
    if (vital.temperature_celsius) {
      if (vital.temperature_celsius < 36.1 || vital.temperature_celsius > 37.2) {
        alerts.push('temperature')
      }
    }

    // Check heart rate (normal: 60-100 bpm)
    if (vital.heart_rate_bpm) {
      if (vital.heart_rate_bpm < 60 || vital.heart_rate_bpm > 100) {
        alerts.push('heart_rate')
      }
    }

    // Check blood pressure (normal: systolic < 120, diastolic < 80)
    if (vital.blood_pressure_systolic && vital.blood_pressure_diastolic) {
      if (vital.blood_pressure_systolic > 140 || vital.blood_pressure_diastolic > 90) {
        alerts.push('blood_pressure')
      }
    }

    // Check oxygen level (normal: > 95%)
    if (vital.oxygen_level_percent) {
      if (vital.oxygen_level_percent < 95) {
        alerts.push('oxygen')
      }
    }

    if (alerts.length > 0) {
      return { status: 'alert', color: 'red', alerts }
    }

    return { status: 'normal', color: 'green' }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alerts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patients.filter(p => getVitalStatus(getLatestVital(p.id)).status === 'alert').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Normal</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patients.filter(p => getVitalStatus(getLatestVital(p.id)).status === 'normal').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">No Recent Data</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patients.filter(p => !getLatestVital(p.id)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Patient Vitals Overview</CardTitle>
              <CardDescription>
                Monitor your patients' vital signs and health metrics
              </CardDescription>
            </div>
            <AddPatientDialog onPatientAdded={loadPatientsAndVitals} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search patients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {filteredPatients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients Found</h3>
              <p className="text-gray-600">
                {patients.length === 0 
                  ? "You don't have any patients assigned yet."
                  : "No patients match your search criteria."
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredPatients.map((patient) => {
                const latestVital = getLatestVital(patient.id)
                const vitalStatus = getVitalStatus(latestVital)
                
                return (
                  <Card key={patient.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{patient.name}</CardTitle>
                          <CardDescription>{patient.email}</CardDescription>
                        </div>
                        <Badge 
                          variant={vitalStatus.color === 'red' ? 'destructive' : 
                                  vitalStatus.color === 'green' ? 'default' : 'secondary'}
                        >
                          {vitalStatus.status === 'alert' ? 'Alert' : 
                           vitalStatus.status === 'normal' ? 'Normal' : 'No Data'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {latestVital ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            {latestVital.temperature_celsius && (
                              <div className="flex items-center space-x-2">
                                <Thermometer className="w-4 h-4 text-red-500" />
                                <span className="text-sm">
                                  {latestVital.temperature_celsius}°C
                                </span>
                              </div>
                            )}
                            
                            {latestVital.heart_rate_bpm && (
                              <div className="flex items-center space-x-2">
                                <Heart className="w-4 h-4 text-red-500" />
                                <span className="text-sm">
                                  {latestVital.heart_rate_bpm} bpm
                                </span>
                              </div>
                            )}
                            
                            {latestVital.blood_pressure_systolic && latestVital.blood_pressure_diastolic && (
                              <div className="flex items-center space-x-2">
                                <Activity className="w-4 h-4 text-blue-500" />
                                <span className="text-sm">
                                  {latestVital.blood_pressure_systolic}/{latestVital.blood_pressure_diastolic}
                                </span>
                              </div>
                            )}
                            
                            {latestVital.oxygen_level_percent && (
                              <div className="flex items-center space-x-2">
                                <Droplets className="w-4 h-4 text-blue-500" />
                                <span className="text-sm">
                                  {latestVital.oxygen_level_percent}% O₂
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Last updated: {formatDate(latestVital.recorded_at)}</span>
                            <span className="capitalize">{latestVital.measurement_source}</span>
                          </div>
                          
                          {patient.medical_conditions && patient.medical_conditions.length > 0 && (
                            <div className="pt-2 border-t">
                              <p className="text-xs text-gray-600 mb-1">Conditions:</p>
                              <div className="flex flex-wrap gap-1">
                                {patient.medical_conditions.slice(0, 2).map((condition, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {condition}
                                  </Badge>
                                ))}
                                {patient.medical_conditions.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{patient.medical_conditions.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">No recent vital signs</p>
                          <p className="text-xs text-gray-500">Last 7 days</p>
                        </div>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-4"
                        onClick={() => setSelectedPatient(patient.id)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}