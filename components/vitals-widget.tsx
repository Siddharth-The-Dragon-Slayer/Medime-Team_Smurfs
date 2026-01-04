"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Thermometer, Activity, ArrowRight } from "lucide-react"
import Link from "next/link"

interface VitalSigns {
  temperature: number
  heartRate: number
  oxygenLevel: number
  timestamp: string
}

export function VitalsWidget() {
  const [vitals, setVitals] = useState<VitalSigns>({
    temperature: 36.5,
    heartRate: 72,
    oxygenLevel: 98,
    timestamp: ""
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Simulate some vitals data
    const updateVitals = () => {
      setVitals({
        temperature: parseFloat((36.0 + Math.random() * 1.5).toFixed(1)),
        heartRate: Math.floor(65 + Math.random() * 25),
        oxygenLevel: Math.floor(96 + Math.random() * 4),
        timestamp: new Date().toLocaleTimeString()
      })
    }
    
    updateVitals()
    const interval = setInterval(updateVitals, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const getVitalStatus = (type: string, value: number) => {
    switch (type) {
      case 'temperature':
        if (value >= 35.5 && value <= 37.5) return 'normal'
        return 'warning'
      case 'heartRate':
        if (value >= 60 && value <= 100) return 'normal'
        return 'warning'
      case 'oxygenLevel':
        if (value >= 95) return 'normal'
        return 'warning'
      default:
        return 'normal'
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'normal' ? 'text-green-600' : 'text-yellow-600'
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-green-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-600" />
          Vitals Overview
        </CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link href="/vitals" className="flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Temperature */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Thermometer className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-xl font-bold">{vitals.temperature}°C</div>
            <div className={`text-xs font-medium ${getStatusColor(getVitalStatus('temperature', vitals.temperature))}`}>
              {getVitalStatus('temperature', vitals.temperature).toUpperCase()}
            </div>
          </div>

          {/* Heart Rate */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Heart className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-xl font-bold">{vitals.heartRate}</div>
            <div className={`text-xs font-medium ${getStatusColor(getVitalStatus('heartRate', vitals.heartRate))}`}>
              BPM
            </div>
          </div>

          {/* Oxygen Level */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-xl font-bold">{vitals.oxygenLevel}%</div>
            <div className={`text-xs font-medium ${getStatusColor(getVitalStatus('oxygenLevel', vitals.oxygenLevel))}`}>
              SpO2
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
          <span>Last updated: {mounted ? vitals.timestamp : 'Loading...'}</span>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span>Live</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}