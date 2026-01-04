"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Activity, TrendingUp } from "lucide-react"

// Static data that's always available
const vitalsData = [
  { time: '00:00', temperature: 36.2, heartRate: 68, oxygenLevel: 98, bloodPressureSystolic: 118, bloodPressureDiastolic: 78 },
  { time: '02:00', temperature: 36.1, heartRate: 65, oxygenLevel: 97, bloodPressureSystolic: 115, bloodPressureDiastolic: 75 },
  { time: '04:00', temperature: 36.0, heartRate: 62, oxygenLevel: 98, bloodPressureSystolic: 112, bloodPressureDiastolic: 72 },
  { time: '06:00', temperature: 36.3, heartRate: 70, oxygenLevel: 99, bloodPressureSystolic: 120, bloodPressureDiastolic: 80 },
  { time: '08:00', temperature: 36.5, heartRate: 75, oxygenLevel: 98, bloodPressureSystolic: 125, bloodPressureDiastolic: 82 },
  { time: '10:00', temperature: 36.7, heartRate: 78, oxygenLevel: 97, bloodPressureSystolic: 128, bloodPressureDiastolic: 85 },
  { time: '12:00', temperature: 36.8, heartRate: 82, oxygenLevel: 98, bloodPressureSystolic: 130, bloodPressureDiastolic: 88 },
  { time: '14:00', temperature: 37.0, heartRate: 85, oxygenLevel: 97, bloodPressureSystolic: 132, bloodPressureDiastolic: 90 },
  { time: '16:00', temperature: 36.9, heartRate: 80, oxygenLevel: 98, bloodPressureSystolic: 128, bloodPressureDiastolic: 86 },
  { time: '18:00', temperature: 36.7, heartRate: 76, oxygenLevel: 98, bloodPressureSystolic: 124, bloodPressureDiastolic: 82 },
  { time: '20:00', temperature: 36.5, heartRate: 72, oxygenLevel: 97, bloodPressureSystolic: 120, bloodPressureDiastolic: 80 },
  { time: '22:00', temperature: 36.3, heartRate: 69, oxygenLevel: 98, bloodPressureSystolic: 118, bloodPressureDiastolic: 78 }
]

export function VitalsGraph() {
  return (
    <Card className="border-green-200/20 bg-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-600" />
          Vitals Trends - Last 24 Hours
          <TrendingUp className="h-4 w-4 text-green-500 ml-auto" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temperature & Heart Rate Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-700/80 mb-3">Temperature & Heart Rate</h4>
            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitalsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(229, 231, 235, 0.3)" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12, fill: 'rgba(107, 114, 128, 0.8)' }}
                  />
                  <YAxis 
                    yAxisId="temp" 
                    orientation="left" 
                    domain={[35, 39]} 
                    tick={{ fontSize: 12, fill: 'rgba(107, 114, 128, 0.8)' }}
                  />
                  <YAxis 
                    yAxisId="hr" 
                    orientation="right" 
                    domain={[50, 120]} 
                    tick={{ fontSize: 12, fill: 'rgba(107, 114, 128, 0.8)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      border: '1px solid rgba(229, 231, 235, 0.5)',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    yAxisId="temp"
                    type="monotone"
                    dataKey="temperature"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                    name="Temperature (°C)"
                  />
                  <Line
                    yAxisId="hr"
                    type="monotone"
                    dataKey="heartRate"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                    name="Heart Rate (BPM)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Oxygen & Blood Pressure Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-700/80 mb-3">Oxygen Level & Blood Pressure</h4>
            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitalsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(229, 231, 235, 0.3)" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12, fill: 'rgba(107, 114, 128, 0.8)' }}
                  />
                  <YAxis 
                    yAxisId="oxygen" 
                    orientation="left" 
                    domain={[90, 100]} 
                    tick={{ fontSize: 12, fill: 'rgba(107, 114, 128, 0.8)' }}
                  />
                  <YAxis 
                    yAxisId="bp" 
                    orientation="right" 
                    domain={[60, 150]} 
                    tick={{ fontSize: 12, fill: 'rgba(107, 114, 128, 0.8)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      border: '1px solid rgba(229, 231, 235, 0.5)',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    yAxisId="oxygen"
                    type="monotone"
                    dataKey="oxygenLevel"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                    name="Oxygen Level (%)"
                  />
                  <Line
                    yAxisId="bp"
                    type="monotone"
                    dataKey="bloodPressureSystolic"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
                    name="Systolic BP (mmHg)"
                  />
                  <Line
                    yAxisId="bp"
                    type="monotone"
                    dataKey="bloodPressureDiastolic"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                    name="Diastolic BP (mmHg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200/20">
          <div className="text-center">
            <div className="text-sm text-gray-600/80">Avg Temperature</div>
            <div className="text-lg font-semibold text-red-600">36.5°C</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600/80">Avg Heart Rate</div>
            <div className="text-lg font-semibold text-blue-600">74 BPM</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600/80">Avg Oxygen</div>
            <div className="text-lg font-semibold text-green-600">98%</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600/80">Avg Blood Pressure</div>
            <div className="text-lg font-semibold text-purple-600">123/81</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}