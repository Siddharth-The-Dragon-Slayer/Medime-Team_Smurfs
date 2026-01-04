"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Thermometer, Droplets, Activity, AlertTriangle, Play, Pause, Wifi, WifiOff, Save, Database } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"

interface VitalSigns {
  temperature: number
  heartRate: number
  oxygenLevel: number
  humidity: number
  timestamp: string
}

interface VitalData {
  time: string
  temperature: number
  heartRate: number
  oxygenLevel: number
  humidity: number
}

interface ArduinoResponse {
  temperature: number
  heartRate: number
  oxygenLevel: number
  humidity: number
  timestamp: string
  connected: boolean
  source: string
  error?: string
}

export function VitalSignsDashboard() {
  const [vitals, setVitals] = useState<VitalSigns>({
    temperature: 36.5,
    heartRate: 72,
    oxygenLevel: 98,
    humidity: 45,
    timestamp: ""
  })

  // Initialize with some default data so graph always shows
  const [historicalData, setHistoricalData] = useState<VitalData[]>([
    { time: "10:00", temperature: 36.5, heartRate: 72, oxygenLevel: 98, humidity: 45 },
    { time: "10:05", temperature: 36.6, heartRate: 74, oxygenLevel: 97, humidity: 46 },
    { time: "10:10", temperature: 36.4, heartRate: 70, oxygenLevel: 98, humidity: 44 },
    { time: "10:15", temperature: 36.7, heartRate: 76, oxygenLevel: 99, humidity: 47 },
    { time: "10:20", temperature: 36.5, heartRate: 73, oxygenLevel: 98, humidity: 45 }
  ])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [arduinoConnected, setArduinoConnected] = useState(false)
  const [useSimulation, setUseSimulation] = useState(false)
  const [alerts, setAlerts] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [connectionError, setConnectionError] = useState<string>("")
  const [autoSave, setAutoSave] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string>("")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fix hydration issue by only setting timestamp on client
  useEffect(() => {
    setMounted(true)
    setVitals(prev => ({
      ...prev,
      timestamp: new Date().toLocaleTimeString()
    }))
  }, [])

  // Fetch real data from Arduino or simulate
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isMonitoring) {
      // Fetch immediately on start
      fetchVitalSigns()

      // Then fetch every 10 seconds (matching Arduino's sensor read interval)
      interval = setInterval(() => {
        fetchVitalSigns()
      }, 10000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isMonitoring, useSimulation])

  const saveVitalsToDatabase = async (vitalsData: VitalSigns) => {
    try {
      setIsSaving(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("User not authenticated")
      }

      const { error } = await supabase
        .from('vitals')
        .insert({
          user_id: user.id,
          temperature_celsius: vitalsData.temperature,
          heart_rate_bpm: vitalsData.heartRate,
          oxygen_level_percent: vitalsData.oxygenLevel,
          humidity_percent: vitalsData.humidity,
          measurement_source: useSimulation ? 'manual' : 'device',
          device_id: useSimulation ? 'simulator' : process.env.NEXT_PUBLIC_ARDUINO_IP || 'arduino_device',
          recorded_at: new Date().toISOString(),
          notes: `Recorded via ${useSimulation ? 'manual entry' : 'Arduino device'}`
        })

      if (error) {
        throw error
      }

      setLastSaved(new Date().toLocaleTimeString())
      toast.success("Vitals saved successfully")
    } catch (error: any) {
      console.error('Failed to save vitals:', error)
      toast.error(`Failed to save vitals: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const fetchVitalSigns = async () => {
    const now = new Date()
    const timeString = now.toLocaleTimeString()

    if (useSimulation) {
      // Simulation mode - occasionally generate critical values for testing
      const shouldGenerateCritical = Math.random() < 0.3 // 30% chance of critical values
      
      let temperature, heartRate
      
      if (shouldGenerateCritical) {
        // Generate critical values for testing
        const criticalType = Math.random()
        if (criticalType < 0.25) {
          temperature = parseFloat((38.5 + Math.random() * 2).toFixed(1)) // High fever
          heartRate = Math.floor(60 + Math.random() * 40)
        } else if (criticalType < 0.5) {
          temperature = parseFloat((34.0 + Math.random() * 1.5).toFixed(1)) // Hypothermia
          heartRate = Math.floor(60 + Math.random() * 40)
        } else if (criticalType < 0.75) {
          temperature = parseFloat((36.0 + Math.random() * 2.5).toFixed(1))
          heartRate = Math.floor(125 + Math.random() * 20) // Tachycardia
        } else {
          temperature = parseFloat((36.0 + Math.random() * 2.5).toFixed(1))
          heartRate = Math.floor(40 + Math.random() * 10) // Bradycardia
        }
        console.log('🧪 SIMULATION: Generated critical values for testing')
      } else {
        // Generate normal values
        temperature = parseFloat((36.0 + Math.random() * 2.5).toFixed(1))
        heartRate = Math.floor(60 + Math.random() * 40)
      }
      
      const newVitals: VitalSigns = {
        temperature,
        heartRate,
        oxygenLevel: Math.floor(95 + Math.random() * 5),
        humidity: Math.floor(40 + Math.random() * 20),
        timestamp: timeString
      }

      setVitals(newVitals)
      setArduinoConnected(false)
      setConnectionError("Using simulated data")
      updateHistoricalData(newVitals, timeString)
      await checkVitalAlerts(newVitals)

      // Auto-save if enabled
      if (autoSave) {
        await saveVitalsToDatabase(newVitals)
      }
    } else {
      // Fetch directly from Arduino IP (no API route, no database)
      try {
        const arduinoIP = process.env.NEXT_PUBLIC_ARDUINO_IP || '10.159.145.184' // Arduino IP from env
        console.log(`Fetching directly from Arduino: http://${arduinoIP}/data`)
        
        const response = await fetch(`http://${arduinoIP}/data`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        })

        if (!response.ok) {
          throw new Error(`Arduino responded with status: ${response.status}`)
        }

        const data = await response.json()
        
        // Transform Arduino data to dashboard format
        // Convert heartbeat analog value (0-1023) to estimated BPM (60-100)
        const heartRateBPM = Math.floor(60 + (data.heartbeat / 1023) * 40)
        
        const newVitals: VitalSigns = {
          temperature: parseFloat(data.temperature) || 0,
          heartRate: heartRateBPM,
          oxygenLevel: 98, // Default value
          humidity: 45, // Default value
          timestamp: timeString
        }

        setVitals(newVitals)
        setArduinoConnected(true)
        setConnectionError("")
        updateHistoricalData(newVitals, timeString)
        await checkVitalAlerts(newVitals)

        // Auto-save if enabled
        if (autoSave) {
          await saveVitalsToDatabase(newVitals)
        }
        
      } catch (error: any) {
        console.error('Failed to fetch Arduino data:', error)
        setArduinoConnected(false)
        setConnectionError(error.message || "Failed to connect to Arduino")
        setUseSimulation(true)
      }
    }
  }

  const updateHistoricalData = (newVitals: VitalSigns, timeString: string) => {
    setHistoricalData(prev => {
      const newData = [...prev, {
        time: timeString,
        temperature: newVitals.temperature,
        heartRate: newVitals.heartRate,
        oxygenLevel: newVitals.oxygenLevel,
        humidity: newVitals.humidity
      }]
      return newData.slice(-20) // Keep last 20 points
    })
  }

  const checkVitalAlerts = async (vitals: VitalSigns) => {
    const newAlerts: string[] = []
    let isCritical = false

    console.log('🔍 Checking vitals for alerts:', { temperature: vitals.temperature, heartRate: vitals.heartRate })

    // Check temperature
    if (vitals.temperature > 38.0) {
      newAlerts.push(`High temperature: ${vitals.temperature}°C`)
      isCritical = true
      console.log('🌡️ CRITICAL: High temperature detected:', vitals.temperature)
    } else if (vitals.temperature < 35.5) {
      newAlerts.push(`Low temperature: ${vitals.temperature}°C`)
      isCritical = true
      console.log('🧊 CRITICAL: Low temperature detected:', vitals.temperature)
    }

    // Check heart rate
    if (vitals.heartRate > 120) {
      newAlerts.push(`High heart rate: ${vitals.heartRate} BPM`)
      isCritical = true
      console.log('💓 CRITICAL: High heart rate detected:', vitals.heartRate)
    } else if (vitals.heartRate < 50) {
      newAlerts.push(`Low heart rate: ${vitals.heartRate} BPM`)
      isCritical = true
      console.log('💔 CRITICAL: Low heart rate detected:', vitals.heartRate)
    } else if (vitals.heartRate > 100) {
      newAlerts.push(`High heart rate: ${vitals.heartRate} BPM`)
      console.log('⚠️ WARNING: Elevated heart rate:', vitals.heartRate)
    } else if (vitals.heartRate < 60) {
      newAlerts.push(`Low heart rate: ${vitals.heartRate} BPM`)
      console.log('⚠️ WARNING: Low heart rate:', vitals.heartRate)
    }

    if (vitals.oxygenLevel < 95) {
      newAlerts.push(`Low oxygen level: ${vitals.oxygenLevel}%`)
    }

    setAlerts(newAlerts)

    // Send SOS email if critical vitals detected
    if (isCritical) {
      console.log('🚨 CRITICAL VITALS DETECTED - Attempting to send SOS email...')
      try {
        const response = await fetch('/api/vitals/sos-alert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            temperature: vitals.temperature,
            heartRate: vitals.heartRate
          })
        })

        console.log('📡 SOS API Response status:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ SOS API Error Response:', errorText)
          throw new Error(`API responded with status ${response.status}: ${errorText}`)
        }

        const result = await response.json()
        console.log('📨 SOS API Result:', result)
        
        if (result.critical && result.alertSent) {
          console.log('✅ SOS email sent successfully!')
          toast.error(`🚨 CRITICAL ALERT: ${result.alertType} - SOS email sent!`, {
            duration: 10000,
            style: {
              backgroundColor: '#fee2e2',
              borderColor: '#dc2626',
              color: '#991b1b'
            }
          })
        } else if (result.critical && !result.alertSent) {
          console.log('⚠️ Critical vitals detected but email failed to send')
          toast.warning(`⚠️ Critical vitals detected but email failed to send`, {
            duration: 8000
          })
        }
      } catch (error) {
        console.error('🚨 Failed to send SOS alert:', error)
        toast.error(`Failed to send critical alert notification: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } else {
      console.log('✅ Vitals are within acceptable ranges')
    }
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
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

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real-Time Vital Signs Monitor
            </span>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setAutoSave(!autoSave)}
                variant={autoSave ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                {autoSave ? "Auto-Save ON" : "Auto-Save OFF"}
              </Button>
              <Button
                onClick={() => saveVitalsToDatabase(vitals)}
                variant="outline"
                size="sm"
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Now"}
              </Button>
              <Button
                onClick={() => setUseSimulation(!useSimulation)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {useSimulation ? "Use Real Data" : "Use Simulation"}
              </Button>
              <Button
                onClick={() => setIsMonitoring(!isMonitoring)}
                variant={isMonitoring ? "destructive" : "default"}
                className="flex items-center gap-2"
              >
                {isMonitoring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-sm text-gray-600">
                {isMonitoring ? 'Monitoring active' : 'Monitoring paused'}
              </span>
            </div>

            {/* Arduino Connection Status */}
            <div className="flex items-center gap-2">
              {arduinoConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-600" />
                  <Badge className="bg-green-100 text-green-800">Arduino Connected</Badge>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-gray-400" />
                  <Badge className="bg-gray-100 text-gray-600">
                    {useSimulation ? "Simulation Mode" : "Arduino Disconnected"}
                  </Badge>
                </>
              )}
            </div>

            {/* Save Status */}
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${autoSave ? 'bg-blue-500' : 'bg-gray-300'}`} />
              <span className="text-sm text-gray-600">
                {autoSave ? 'Auto-saving enabled' : 'Manual save only'}
              </span>
            </div>

            {connectionError && !arduinoConnected && (
              <span className="text-xs text-gray-500">
                {connectionError}
              </span>
            )}

            <div className="text-sm text-gray-500">
              {mounted ? `Last updated: ${vitals.timestamp}` : 'Loading...'}
            </div>

            {lastSaved && (
              <div className="text-sm text-blue-600">
                Last saved: {lastSaved}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-center gap-2 text-red-700">
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                  {alert}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vital Signs Cards */}
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
                <div className={`h-3 w-3 rounded-full ${getStatusColor(getVitalStatus('temperature', vitals.temperature))} ${isMonitoring ? 'animate-pulse' : ''}`} />
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
                <div className={`h-3 w-3 rounded-full ${getStatusColor(getVitalStatus('heartRate', vitals.heartRate))} ${isMonitoring ? 'animate-pulse' : ''}`} />
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
                <div className={`h-3 w-3 rounded-full ${getStatusColor(getVitalStatus('oxygenLevel', vitals.oxygenLevel))} ${isMonitoring ? 'animate-pulse' : ''}`} />
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
                <div className={`h-3 w-3 rounded-full ${getStatusColor(getVitalStatus('humidity', vitals.humidity))} ${isMonitoring ? 'animate-pulse' : ''}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Always show */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature & Heart Rate Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Temperature & Heart Rate Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="temp" orientation="left" domain={[35, 40]} />
                <YAxis yAxisId="hr" orientation="right" domain={[50, 120]} />
                <Tooltip />
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="temperature"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Temperature (°C)"
                />
                <Line
                  yAxisId="hr"
                  type="monotone"
                  dataKey="heartRate"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Heart Rate (BPM)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Oxygen & Humidity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Oxygen Level & Humidity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="oxygen" orientation="left" domain={[90, 100]} />
                <YAxis yAxisId="humidity" orientation="right" domain={[30, 70]} />
                <Tooltip />
                <Line
                  yAxisId="oxygen"
                  type="monotone"
                  dataKey="oxygenLevel"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Oxygen Level (%)"
                />
                <Line
                  yAxisId="humidity"
                  type="monotone"
                  dataKey="humidity"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Humidity (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}