"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Thermometer } from "lucide-react"

interface VitalSigns {
  temperature: number
  heartRate: number
  timestamp: string
}

export function VitalsTempHrOnly() {
  const [vitals, setVitals] = useState<VitalSigns>({
    temperature: 37.2,
    heartRate: 79,
    timestamp: ""
  })
  const [mounted, setMounted] = useState(false)

  // Fix hydration issue by only setting timestamp on client
  useEffect(() => {
    setMounted(true)
    setVitals(prev => ({
      ...prev,
      timestamp: new Date().toLocaleTimeString()
    }))
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
      <Card className="bg-white/80 backdrop-blur-sm border-green-200">
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
      <Card className="bg-white/80 backdrop-blur-sm border-green-200">
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
      <Card className="bg-white/80 backdrop-blur-sm border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Oxygen Level</CardTitle>
          <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">98%</div>
              <p className="text-xs text-muted-foreground">Blood oxygen (SpO2)</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className="bg-green-100 text-green-800">Normal</Badge>
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blood Pressure */}
      <Card className="bg-white/80 backdrop-blur-sm border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
          <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">120/80</div>
              <p className="text-xs text-muted-foreground">mmHg (Systolic/Diastolic)</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className="bg-green-100 text-green-800">Normal</Badge>
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}