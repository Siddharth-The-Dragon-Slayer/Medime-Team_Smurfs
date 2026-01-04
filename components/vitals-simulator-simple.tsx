"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Play, Pause, Database, Zap, Save, Activity } from "lucide-react"
import { toast } from "sonner"

export function VitalsSimulatorSimple() {
  const [isSimulating, setIsSimulating] = useState(false)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
  const [savedCount, setSavedCount] = useState(0)
  const supabase = createClient()

  const generateRealisticVitals = () => {
    return {
      temperature_celsius: parseFloat((36.0 + Math.random() * 2.5).toFixed(1)),
      heart_rate_bpm: Math.floor(60 + Math.random() * 40),
      oxygen_level_percent: parseFloat((95 + Math.random() * 5).toFixed(1)),
      humidity_percent: parseFloat((40 + Math.random() * 20).toFixed(1)),
      blood_pressure_systolic: Math.floor(110 + Math.random() * 30),
      blood_pressure_diastolic: Math.floor(70 + Math.random() * 20)
    }
  }

  const saveVitals = async (vitals: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('vitals')
        .insert([{
          ...vitals,
          user_id: user.id,
          recorded_at: new Date().toISOString()
        }])

      if (error) throw error
      return true
    } catch (error) {
      console.error('Failed to save vitals:', error)
      throw error
    }
  }

  const startSimulation = () => {
    if (intervalId) return

    setIsSimulating(true)
    const id = setInterval(async () => {
      try {
        const vitals = generateRealisticVitals()
        await saveVitals(vitals)
        setSavedCount(prev => prev + 1)
        toast.success(`Vitals recorded: ${vitals.temperature_celsius}°C, ${vitals.heart_rate_bpm} BPM, ${vitals.oxygen_level_percent}% SpO2`)
      } catch (error) {
        console.error('Failed to save vitals:', error)
        toast.error('Failed to save vital signs')
      }
    }, 5000) // Every 5 seconds

    setIntervalId(id)
  }

  const stopSimulation = () => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
    setIsSimulating(false)
  }

  const addSingleReading = async () => {
    try {
      const vitals = generateRealisticVitals()
      await saveVitals(vitals)
      setSavedCount(prev => prev + 1)
      toast.success(`Single reading saved: ${vitals.temperature_celsius}°C, ${vitals.heart_rate_bpm} BPM`)
    } catch (error) {
      console.error('Failed to save vitals:', error)
      toast.error('Failed to save vital signs')
    }
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Database className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Database Simulator</h3>
            <p className="text-sm text-gray-600 font-normal">Generate test data</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-white rounded-lg border border-purple-100">
          <p className="text-sm text-gray-700 mb-3">
            Simulate real device data by saving vital signs to your Supabase database
          </p>
          
          {savedCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-purple-600 mb-3">
              <Activity className="h-4 w-4" />
              <span className="font-medium">{savedCount} readings saved</span>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={isSimulating ? stopSimulation : startSimulation}
            variant={isSimulating ? "destructive" : "default"}
            className={`w-full flex items-center gap-2 py-3 transition-all duration-200 ${
              isSimulating 
                ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200" 
                : "bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200"
            }`}
          >
            {isSimulating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isSimulating ? "Stop Auto-Save" : "Start Auto-Save"}
          </Button>
          
          <Button
            onClick={addSingleReading}
            variant="outline"
            className="w-full flex items-center gap-2 py-3 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
          >
            <Save className="h-4 w-4" />
            Save Single Reading
          </Button>
        </div>

        {isSimulating && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
              <div>
                <p className="text-sm font-medium text-green-800">Auto-save Active</p>
                <p className="text-xs text-green-600">Saving vitals every 5 seconds...</p>
              </div>
              <Zap className="h-4 w-4 text-green-600 ml-auto" />
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          Generated data includes temperature, heart rate, oxygen levels, humidity, and blood pressure readings
        </div>
      </CardContent>
    </Card>
  )
}