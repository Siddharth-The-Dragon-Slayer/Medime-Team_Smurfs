"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useVitals } from "@/hooks/use-vitals"
import { Play, Pause, Database } from "lucide-react"
import { toast } from "sonner"

export function VitalsSimulator() {
  const [isSimulating, setIsSimulating] = useState(false)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
  const { addVitalSigns } = useVitals()

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

  const startSimulation = () => {
    if (intervalId) return

    setIsSimulating(true)
    const id = setInterval(async () => {
      try {
        const vitals = generateRealisticVitals()
        await addVitalSigns(vitals)
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
      await addVitalSigns(vitals)
      toast.success(`Single reading saved: ${vitals.temperature_celsius}°C, ${vitals.heart_rate_bpm} BPM`)
    } catch (error) {
      console.error('Failed to save vitals:', error)
      toast.error('Failed to save vital signs')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Simulate real device data by saving vital signs to your Supabase database
        </p>
        
        <div className="flex gap-2">
          <Button
            onClick={isSimulating ? stopSimulation : startSimulation}
            variant={isSimulating ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {isSimulating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isSimulating ? "Stop Auto-Save" : "Start Auto-Save"}
          </Button>
          
          <Button
            onClick={addSingleReading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Save Single Reading
          </Button>
        </div>

        {isSimulating && (
          <div className="text-sm text-green-600 flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            Auto-saving vitals every 5 seconds...
          </div>
        )}
      </CardContent>
    </Card>
  )
}