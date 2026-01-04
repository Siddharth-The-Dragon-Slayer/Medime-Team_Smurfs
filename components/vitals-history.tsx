"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Heart, Thermometer, Droplets, Activity, Calendar, Clock, Trash2, RefreshCw } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"
import { format } from "date-fns"

interface VitalRecord {
  id: string
  temperature_celsius: number
  heart_rate_bpm: number
  oxygen_level_percent: number
  humidity_percent: number
  measurement_source: string
  device_id: string
  recorded_at: string
  notes?: string
}

export function VitalsHistory() {
  const [vitals, setVitals] = useState<VitalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchVitals = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('vitals')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setVitals(data || [])
    } catch (error: any) {
      console.error('Failed to fetch vitals:', error)
      toast.error(`Failed to load vitals history: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const deleteVital = async (id: string) => {
    try {
      setDeleting(id)
      const { error } = await supabase
        .from('vitals')
        .delete()
        .eq('id', id)

      if (error) throw error

      setVitals(prev => prev.filter(v => v.id !== id))
      toast.success("Vital record deleted successfully")
    } catch (error: any) {
      console.error('Failed to delete vital:', error)
      toast.error(`Failed to delete record: ${error.message}`)
    } finally {
      setDeleting(null)
    }
  }

  useEffect(() => {
    fetchVitals()
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
      default:
        return 'normal'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal': return <Badge className="bg-green-100 text-green-800 text-xs">Normal</Badge>
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Warning</Badge>
      case 'critical': return <Badge className="bg-red-100 text-red-800 text-xs">Critical</Badge>
      default: return <Badge className="text-xs">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Vitals History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Vitals History ({vitals.length})
          </span>
          <Button
            onClick={fetchVitals}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {vitals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No vitals recorded yet</p>
            <p className="text-sm">Start monitoring to see your vitals history</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {vitals.map((vital) => (
                <div
                  key={vital.id}
                  className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        {format(new Date(vital.recorded_at), 'MMM dd, yyyy')}
                      </span>
                      <Clock className="h-4 w-4 text-gray-500 ml-2" />
                      <span className="text-sm text-gray-600">
                        {format(new Date(vital.recorded_at), 'HH:mm:ss')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {vital.measurement_source}
                      </Badge>
                      <Button
                        onClick={() => deleteVital(vital.id)}
                        variant="ghost"
                        size="sm"
                        disabled={deleting === vital.id}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Temperature */}
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-red-500" />
                      <div>
                        <div className="text-sm font-medium">{vital.temperature_celsius}°C</div>
                        {getStatusBadge(getVitalStatus('temperature', vital.temperature_celsius))}
                      </div>
                    </div>

                    {/* Heart Rate */}
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <div>
                        <div className="text-sm font-medium">{vital.heart_rate_bpm} BPM</div>
                        {getStatusBadge(getVitalStatus('heartRate', vital.heart_rate_bpm))}
                      </div>
                    </div>

                    {/* Oxygen Level */}
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">{vital.oxygen_level_percent}%</div>
                        {getStatusBadge(getVitalStatus('oxygenLevel', vital.oxygen_level_percent))}
                      </div>
                    </div>

                    {/* Humidity */}
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">{vital.humidity_percent}%</div>
                        <Badge className="bg-gray-100 text-gray-800 text-xs">Env</Badge>
                      </div>
                    </div>
                  </div>

                  {vital.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600">{vital.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}