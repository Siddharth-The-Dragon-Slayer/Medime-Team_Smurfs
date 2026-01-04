"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Thermometer, Droplets, Activity, AlertTriangle, Play, Pause, Zap, TrendingUp, TrendingDown } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

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

export function VitalSignsDashboard() {
  const [vitals, setVitals] = useState<VitalSigns>({
    temperature: 36.5,
    heartRate: 72,
    oxygenLevel: 98,
    humidity: 45,
    timestamp: ""
  })
  
  const [historicalData, setHistoricalData] = useState<VitalData[]>([])
  const [isSimulating, setIsSimulating] = useState(false)
  const [alerts, setAlerts] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  // Fix hydration issue by only setting timestamp on client
  useEffect(() => {
    setMounted(true)
    setVitals(prev => ({
      ...prev,
      timestamp: new Date().toLocaleTimeString()
    }))
  }, [])

  // Simulate real-time vital signs
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isSimulating) {
      interval = setInterval(() => {
        const now = new Date()
        const timeString = now.toLocaleTimeString()
        
        // Generate realistic vital sign variations
        const newVitals: VitalSigns = {
          temperature: parseFloat((36.0 + Math.random() * 2.5).toFixed(1)), // 36.0-38.5°C
          heartRate: Math.floor(60 + Math.random() * 40), // 60-100 BPM
          oxygenLevel: Math.floor(95 + Math.random() * 5), // 95-100%
          humidity: Math.floor(40 + Math.random() * 20), // 40-60%
          timestamp: timeString
        }

        setVitals(newVitals)

        // Add to historical data (keep last 20 points)
        setHistoricalData(prev => {
          const newData = [...prev, {
            time: timeString,
            temperature: newVitals.temperature,
            heartRate: newVitals.heartRate,
            oxygenLevel: newVitals.oxygenLevel,
            humidity: newVitals.humidity
          }]
          return newData.slice(-20)
        })

        // Check for alerts
        checkVitalAlerts(newVitals)
      }, 2000) // Update every 2 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isSimulating])

  const checkVitalAlerts = (vitals: VitalSigns) => {
    const newAlerts: string[] = []

    if (vitals.temperature > 38.0) {
      newAlerts.push(`High temperature: ${vitals.temperature}°C`)
    } else if (vitals.temperature < 35.5) {
      newAlerts.push(`Low temperature: ${vitals.temperature}°C`)
    }

    if (vitals.heartRate > 100) {
      newAlerts.push(`High heart rate: ${vitals.heartRate} BPM`)
    } else if (vitals.heartRate < 60) {
      newAlerts.push(`Low heart rate: ${vitals.heartRate} BPM`)
    }

    if (vitals.oxygenLevel < 95) {
      newAlerts.push(`Low oxygen level: ${vitals.oxygenLevel}%`)
    }

    setAlerts(newAlerts)
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
            <Button
              onClick={() => setIsSimulating(!isSimulating)}
              variant={isSimulating ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {isSimulating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isSimulating ? "Stop Simulation" : "Start Simulation"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${isSimulating ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-sm text-gray-600">
                {isSimulating ? 'Live monitoring active' : 'Monitoring paused'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {mounted ? `Last updated: ${vitals.timestamp}` : 'Loading...'}
            </div>
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
                <div className={`h-3 w-3 rounded-full ${getStatusColor(getVitalStatus('temperature', vitals.temperature))} ${isSimulating ? 'animate-pulse' : ''}`} />
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
                <div className={`h-3 w-3 rounded-full ${getStatusColor(getVitalStatus('heartRate', vitals.heartRate))} ${isSimulating ? 'animate-pulse' : ''}`} />
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
                <div className={`h-3 w-3 rounded-full ${getStatusColor(getVitalStatus('oxygenLevel', vitals.oxygenLevel))} ${isSimulating ? 'animate-pulse' : ''}`} />
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
                <div className={`h-3 w-3 rounded-full ${getStatusColor(getVitalStatus('humidity', vitals.humidity))} ${isSimulating ? 'animate-pulse' : ''}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {historicalData.length > 0 && (
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
      )}
    </div>
  )
}