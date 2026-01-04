"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Thermometer, Droplets, Activity } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

interface VitalSigns {
  temperature: number
  heartRate: number
  oxygenLevel: number
  humidity: number
  timestamp: string
}

export function VitalsCardsOnly() {
  const [vitals, setVitals] = useState<VitalSigns>({
    temperature: 36.5,
    heartRate: 72,
    oxygenLevel: 98,
    humidity: 45,
    timestamp: ""
  })
  const [mounted, setMounted] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Save vitals to database
  const saveToDatabase = async (vitalData: VitalSigns) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('vitals').insert({
        user_id: user.id,
        temperature_celsius: vitalData.temperature,
        heart_rate_bpm: vitalData.heartRate,
        oxygen_level_percent: vitalData.oxygenLevel,
        humidity_percent: vitalData.humidity,
        measurement_source: 'device',
        device_id: process.env.NEXT_PUBLIC_ARDUINO_IP || 'arduino_sensor',
        recorded_at: new Date().toISOString()
      })

      setLastSaved(new Date())
      console.log('Vitals saved to database')
    } catch (error) {
      console.error('Failed to save vitals:', error)
    }
  }

  // Fetch vitals from Arduino sensor
  const fetchVitalsFromSensor = async () => {
    try {
      const arduinoIP = process.env.NEXT_PUBLIC_ARDUINO_IP
      if (!arduinoIP) {
        console.warn('Arduino IP not configured, using simulated data')
        return null
      }

      const response = await fetch(`http://${arduinoIP}/vitals`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })

      if (!response.ok) throw new Error('Failed to fetch from sensor')

      const data = await response.json()
      return {
        temperature: data.temperature || 36.5,
        heartRate: data.heartRate || 72,
        oxygenLevel: data.oxygenLevel || 98,
        humidity: data.humidity || 45,
        timestamp: new Date().toLocaleTimeString()
      }
    } catch (error) {
      console.error('Sensor fetch error:', error)
      return null
    }
  }

  useEffect(() => {
    setMounted(true)

    // Fetch and update vitals from sensor
    const updateVitals = async () => {
      const sensorData = await fetchVitalsFromSensor()

      if (sensorData) {
        setVitals(sensorData)
      } else {
        // Fallback to simulated data if sensor unavailable
        setVitals({
          temperature: parseFloat((36.0 + Math.random() * 1.5).toFixed(1)),
          heartRate: Math.floor(65 + Math.random() * 25),
          oxygenLevel: Math.floor(96 + Math.random() * 4),
          humidity: Math.floor(40 + Math.random() * 20),
          timestamp: new Date().toLocaleTimeString()
        })
      }
    }

    // Initial fetch
    updateVitals()

    // Update from sensor every 10 seconds for real-time display
    const updateInterval = setInterval(updateVitals, 10000)

    // Save to database every 1 minute
    const saveInterval = setInterval(async () => {
      const currentVitals = await fetchVitalsFromSensor()
      if (currentVitals) {
        await saveToDatabase(currentVitals)
      }
    }, 60000) // 60000ms = 1 minute

    return () => {
      clearInterval(updateInterval)
      clearInterval(saveInterval)
    }
  }, [])

  const getVitalStatus = (type: string, value: number) => {
    switch (type) {
      case 'temperature':
        if (value >= 35.5 && value <= 37.5) return 'normal'
        if (value > 37.5 && value <= 38.0) return 'warning'
        return 'critical'
      case 'heartRate':
        if (value >= 60 && value <= 100) return 'normal'
        if ((value >= 50 && value < 60) || (value > 100 && value <= 120)) return 'warning'
        return 'critical'
      case 'oxygenLevel':
        if (value >= 95) return 'normal'
        if (value >= 90) return 'warning'
        return 'critical'
      case 'humidity':
        if (value >= 40 && value <= 60) return 'normal'
        return 'warning'
      default:
        return 'normal'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal': return <Badge className="bg-green-100 text-green-800">Normal</Badge>
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'critical': return <Badge className="bg-red-100 text-red-800">Critical</Badge>
      default: return <Badge>Unknown</Badge>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Temperature */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Temperature</CardTitle>
          <Thermometer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{vitals.temperature}°C</div>
              <p className="text-xs text-muted-foreground">Body temperature</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge(getVitalStatus('temperature', vitals.temperature))}
              <div className={`h-3 w-3 rounded-full ${getStatusColor(getVitalStatus('temperature', vitals.temperature))} animate-pulse`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Heart Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{vitals.heartRate} BPM</div>
              <p className="text-xs text-muted-foreground">Beats per minute</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge(getVitalStatus('heartRate', vitals.heartRate))}
              <div className={`h-3 w-3 rounded-full ${getStatusColor(getVitalStatus('heartRate', vitals.heartRate))} animate-pulse`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Oxygen Level */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Oxygen Level</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{vitals.oxygenLevel}%</div>
              <p className="text-xs text-muted-foreground">Blood oxygen (SpO2)</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge(getVitalStatus('oxygenLevel', vitals.oxygenLevel))}
              <div className={`h-3 w-3 rounded-full ${getStatusColor(getVitalStatus('oxygenLevel', vitals.oxygenLevel))} animate-pulse`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Humidity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Humidity</CardTitle>
          <Droplets className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{vitals.humidity}%</div>
              <p className="text-xs text-muted-foreground">Environmental</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge(getVitalStatus('humidity', vitals.humidity))}
              <div className={`h-3 w-3 rounded-full ${getStatusColor(getVitalStatus('humidity', vitals.humidity))} animate-pulse`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}