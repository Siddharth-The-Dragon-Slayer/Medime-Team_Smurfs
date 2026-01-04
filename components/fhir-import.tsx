'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface FHIRImportData {
  patient: {
    name: string
    gender: string
    birthDate: string
    fhirId: string
  }
  conditions: string[]
  medications: Array<{
    name: string
    status: string
    authoredOn: string
    fhirId: string
  }>
  observations: Array<{
    name: string
    value: number
    unit: string
    date: string
    status: string
    fhirId: string
  }>
  encounters: Array<{
    id: string
    status: string
    type: string
    start: string
    end: string
    reason: string
  }>
  summary: {
    totalConditions: number
    totalMedications: number
    totalObservations: number
    totalEncounters: number
    vitalSigns: number
    labResults: number
  }
}

export function FHIRImport() {
  const [fhirId, setFhirId] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [importedData, setImportedData] = useState<FHIRImportData | null>(null)

  const handleImport = async () => {
    if (!fhirId.trim()) {
      setError('Please enter a FHIR ID')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/fhir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fhirId: fhirId.trim() }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import FHIR data')
      }

      setSuccess(true)
      setImportedData(result.data)
      setFhirId('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const dummyFhirIds = ['53740183', '53740188']

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import FHIR Data</CardTitle>
          <CardDescription>
            Enter your FHIR Patient ID to import your medical data from the FHIR server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="fhir-id" className="text-sm font-medium">
              FHIR Patient ID
            </label>
            <Input
              id="fhir-id"
              type="text"
              placeholder="Enter FHIR Patient ID"
              value={fhirId}
              onChange={(e) => setFhirId(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              For testing, you can use these dummy FHIR IDs:
            </p>
            <div className="flex gap-2">
              {dummyFhirIds.map((id) => (
                <Button
                  key={id}
                  variant="outline"
                  size="sm"
                  onClick={() => setFhirId(id)}
                  disabled={loading}
                >
                  {id}
                </Button>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleImport} 
            disabled={loading || !fhirId.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing FHIR Data...
              </>
            ) : (
              'Import FHIR Data'
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                FHIR data imported successfully! Your profile and medications have been updated.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {importedData && (
        <Card>
          <CardHeader>
            <CardTitle>Imported Data Summary</CardTitle>
            <CardDescription>
              Successfully imported {importedData.summary.totalConditions} conditions, {importedData.summary.totalMedications} medications, {importedData.summary.totalObservations} observations, and {importedData.summary.totalEncounters} encounters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Patient Information</h4>
              <div className="text-sm text-muted-foreground space-y-1 bg-gray-50 p-3 rounded">
                <p><strong>Name:</strong> {importedData.patient.name}</p>
                <p><strong>Gender:</strong> {importedData.patient.gender}</p>
                <p><strong>Birth Date:</strong> {importedData.patient.birthDate}</p>
                <p><strong>FHIR ID:</strong> {importedData.patient.fhirId}</p>
              </div>
            </div>

            {importedData.conditions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Medical Conditions ({importedData.conditions.length})</h4>
                <div className="bg-red-50 p-3 rounded">
                  <ul className="text-sm text-red-800 list-disc list-inside space-y-1">
                    {importedData.conditions.map((condition, index) => (
                      <li key={index}>{condition}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {importedData.medications.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Active Medications ({importedData.medications.length})</h4>
                <div className="bg-blue-50 p-3 rounded space-y-3">
                  {importedData.medications.map((medication, index) => (
                    <div key={index} className="text-sm border-l-4 border-blue-400 pl-3">
                      <p className="font-medium text-blue-900">{medication.name}</p>
                      <p className="text-blue-700">Status: {medication.status}</p>
                      {medication.authoredOn && (
                        <p className="text-blue-600">Prescribed: {new Date(medication.authoredOn).toLocaleDateString()}</p>
                      )}
                      <p className="text-xs text-blue-500">FHIR ID: {medication.fhirId}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importedData.observations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Observations & Lab Results ({importedData.observations.length})</h4>
                <div className="bg-green-50 p-3 rounded space-y-3">
                  {importedData.observations.map((observation, index) => (
                    <div key={index} className="text-sm border-l-4 border-green-400 pl-3">
                      <p className="font-medium text-green-900">{observation.name}</p>
                      {observation.value && (
                        <p className="text-green-700">
                          Value: {observation.value} {observation.unit}
                        </p>
                      )}
                      <p className="text-green-600">Status: {observation.status}</p>
                      {observation.date && (
                        <p className="text-green-600">Date: {new Date(observation.date).toLocaleDateString()}</p>
                      )}
                      <p className="text-xs text-green-500">FHIR ID: {observation.fhirId}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importedData.encounters.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Healthcare Encounters ({importedData.encounters.length})</h4>
                <div className="bg-purple-50 p-3 rounded space-y-3">
                  {importedData.encounters.map((encounter, index) => (
                    <div key={index} className="text-sm border-l-4 border-purple-400 pl-3">
                      <p className="font-medium text-purple-900">
                        {encounter.reason} ({encounter.type})
                      </p>
                      <p className="text-purple-700">Status: {encounter.status}</p>
                      {encounter.start && (
                        <p className="text-purple-600">
                          Date: {new Date(encounter.start).toLocaleDateString()}
                          {encounter.end && encounter.end !== encounter.start && 
                            ` - ${new Date(encounter.end).toLocaleDateString()}`
                          }
                        </p>
                      )}
                      <p className="text-xs text-purple-500">FHIR ID: {encounter.id}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-100 p-3 rounded">
              <h4 className="font-semibold mb-2">Import Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Conditions:</strong> {importedData.summary.totalConditions}</p>
                  <p><strong>Medications:</strong> {importedData.summary.totalMedications}</p>
                </div>
                <div>
                  <p><strong>Observations:</strong> {importedData.summary.totalObservations}</p>
                  <p><strong>Encounters:</strong> {importedData.summary.totalEncounters}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}