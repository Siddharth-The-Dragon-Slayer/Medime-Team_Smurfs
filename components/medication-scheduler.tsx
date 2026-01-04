"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, Clock, Pill, Plus, Edit, Trash2, Bell } from "lucide-react"
import { format } from "date-fns"

interface MedicationSchedule {
  id?: string
  medication_id: string
  medication_name: string
  scheduled_time: string
  days_of_week: string[]
  dosage: string
  notes?: string
  is_active: boolean
  created_at?: string
}

interface MedicationSchedulerProps {
  user: any
  profile: any
  medications: any[]
}

export function MedicationScheduler({ user, profile, medications }: MedicationSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<MedicationSchedule | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  // Form state for adding/editing schedules
  const [formData, setFormData] = useState({
    medication_id: "",
    scheduled_time: "",
    days_of_week: [] as string[],
    dosage: "",
    notes: "",
  })

  const daysOfWeek = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ]

  const timeSlots = [
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
  ]

  useEffect(() => {
    loadSchedules()
  }, [])

  const loadSchedules = async () => {
    setIsLoading(true)
    try {
      // For now, we'll create a mock schedules table structure
      // In a real app, you'd create a medication_schedules table
      const mockSchedules: MedicationSchedule[] = medications.map((med, index) => ({
        id: `schedule-${index}`,
        medication_id: med.id,
        medication_name: med.medication_name,
        scheduled_time: index % 2 === 0 ? "08:00" : "20:00",
        days_of_week: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        dosage: med.dosage || "1 tablet",
        notes: "Take with food",
        is_active: true,
      }))
      setSchedules(mockSchedules)
    } catch (error) {
      console.error("Error loading schedules:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSchedule = () => {
    setEditingSchedule(null)
    setFormData({
      medication_id: "",
      scheduled_time: "",
      days_of_week: [],
      dosage: "",
      notes: "",
    })
    setShowAddDialog(true)
  }

  const handleEditSchedule = (schedule: MedicationSchedule) => {
    setEditingSchedule(schedule)
    setFormData({
      medication_id: schedule.medication_id,
      scheduled_time: schedule.scheduled_time,
      days_of_week: schedule.days_of_week,
      dosage: schedule.dosage,
      notes: schedule.notes || "",
    })
    setShowAddDialog(true)
  }

  const handleSaveSchedule = async () => {
    try {
      const selectedMedication = medications.find((med) => med.id === formData.medication_id)

      const newSchedule: MedicationSchedule = {
        id: editingSchedule?.id || `schedule-${Date.now()}`,
        medication_id: formData.medication_id,
        medication_name: selectedMedication?.medication_name || "Unknown",
        scheduled_time: formData.scheduled_time,
        days_of_week: formData.days_of_week,
        dosage: formData.dosage,
        notes: formData.notes,
        is_active: true,
      }

      if (editingSchedule) {
        setSchedules((prev) => prev.map((s) => (s.id === editingSchedule.id ? newSchedule : s)))
      } else {
        setSchedules((prev) => [...prev, newSchedule])
      }

      setShowAddDialog(false)
    } catch (error) {
      console.error("Error saving schedule:", error)
    }
  }

  const handleDeleteSchedule = (scheduleId: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== scheduleId))
  }

  const toggleDayOfWeek = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day],
    }))
  }

  const getTodaysSchedules = () => {
    const today = format(selectedDate, "EEEE").toLowerCase()
    return schedules
      .filter((schedule) => schedule.days_of_week.includes(today) && schedule.is_active)
      .sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Medication Scheduler</h1>
        <p className="text-gray-600">Manage your daily medication schedule and never miss a dose</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calendar Section */}
        <div className="lg:col-span-1">
          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />

              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">{format(selectedDate, "EEEE, MMMM d, yyyy")}</h3>
                <p className="text-sm text-green-700">
                  {getTodaysSchedules().length} medication{getTodaysSchedules().length !== 1 ? "s" : ""} scheduled
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Management */}
        <div className="lg:col-span-2">
          <Card className="border-green-100">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Today's Schedule
                </CardTitle>
                <Button onClick={handleAddSchedule} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {getTodaysSchedules().length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No medications scheduled</h3>
                  <p className="text-gray-600 mb-4">Add a medication schedule to get started</p>
                  <Button onClick={handleAddSchedule} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Schedule
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {getTodaysSchedules().map((schedule) => (
                    <Card key={schedule.id} className="border-blue-100 bg-blue-50/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                              <Pill className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{schedule.medication_name}</h4>
                              <p className="text-sm text-gray-600">{schedule.dosage}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium">{schedule.scheduled_time}</span>
                                <Badge variant="secondary" className="ml-2">
                                  {schedule.days_of_week.length === 7
                                    ? "Daily"
                                    : `${schedule.days_of_week.length} days/week`}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditSchedule(schedule)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteSchedule(schedule.id!)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {schedule.notes && <p className="text-sm text-gray-600 mt-2 ml-16">{schedule.notes}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Schedules Overview */}
          <Card className="border-green-100 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                All Medication Schedules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {schedules.map((schedule) => (
                  <Card key={schedule.id} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm">{schedule.medication_name}</h4>
                        <Badge variant={schedule.is_active ? "default" : "secondary"}>
                          {schedule.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {schedule.dosage} at {schedule.scheduled_time}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {schedule.days_of_week.map((day) => (
                          <Badge key={day} variant="outline" className="text-xs">
                            {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Schedule Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSchedule ? "Edit Schedule" : "Add New Schedule"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="medication">Medication</Label>
              <Select
                value={formData.medication_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, medication_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select medication" />
                </SelectTrigger>
                <SelectContent>
                  {medications.map((med) => (
                    <SelectItem key={med.id} value={med.id}>
                      {med.medication_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="time">Time</Label>
              <Select
                value={formData.scheduled_time}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, scheduled_time: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Days of Week</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {daysOfWeek.map((day) => (
                  <Button
                    key={day.value}
                    type="button"
                    variant={formData.days_of_week.includes(day.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDayOfWeek(day.value)}
                  >
                    {day.label.slice(0, 3)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData((prev) => ({ ...prev, dosage: e.target.value }))}
                placeholder="e.g., 1 tablet, 5ml"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="e.g., Take with food"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveSchedule} className="flex-1">
                {editingSchedule ? "Update Schedule" : "Add Schedule"}
              </Button>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
