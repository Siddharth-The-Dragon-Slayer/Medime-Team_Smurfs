"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Bell, Plus, Trash2, Clock } from "lucide-react"

interface ReminderSetting {
  id: string
  medication: string
  times: string[]
  enabled: boolean
  sound: boolean
  vibration: boolean
  snoozeMinutes: number
}

interface MedicationSchedule {
  id: string
  medication_name: string
  dosage: string
  scheduled_time: string
  days_of_week: string[]
}

interface ReminderSettingsProps {
  user: any
}

export function ReminderSettings({ user }: ReminderSettingsProps) {
  const [reminders, setReminders] = useState<ReminderSetting[]>([])
  const [isLoadingReminders, setIsLoadingReminders] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [medicationSchedules, setMedicationSchedules] = useState<MedicationSchedule[]>([])
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false)
  const [newTime, setNewTime] = useState("")
  const [isAddingReminder, setIsAddingReminder] = useState(false)
  const [selectedMedicationId, setSelectedMedicationId] = useState("")
  const [newReminderTime, setNewReminderTime] = useState("")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  // Load medication schedules and reminders from database
  useEffect(() => {
    if (user?.id) {
      loadMedicationSchedules()
      loadReminders()
    }
  }, [user?.id])

  const loadReminders = async () => {
    setIsLoadingReminders(true)
    try {
      const { data, error } = await supabase
        .from('medication_reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading reminders:', error)
        return
      }

      // Transform database data to match our interface
      const transformedReminders: ReminderSetting[] = data.map(reminder => ({
        id: reminder.id,
        medication: reminder.medication_name,
        times: reminder.reminder_times || [],
        enabled: reminder.is_enabled,
        sound: reminder.sound_enabled,
        vibration: reminder.vibration_enabled,
        snoozeMinutes: reminder.snooze_minutes
      }))

      setReminders(transformedReminders)
    } catch (error) {
      console.error('Error loading reminders:', error)
    } finally {
      setIsLoadingReminders(false)
    }
  }

  const loadMedicationSchedules = async () => {
    setIsLoadingSchedules(true)
    try {
      const { data, error } = await supabase
        .from('medication_schedules')
        .select('id, medication_name, dosage, scheduled_time, days_of_week')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('medication_name', { ascending: true })

      if (error) {
        console.error('Error loading medication schedules:', error)
        return
      }

      setMedicationSchedules(data || [])
    } catch (error) {
      console.error('Error loading medication schedules:', error)
    } finally {
      setIsLoadingSchedules(false)
    }
  }

  const addTimeToReminder = async (reminderId: string, time: string) => {
    if (!time) return

    const reminder = reminders.find(r => r.id === reminderId)
    if (!reminder) return

    const updatedTimes = [...reminder.times, time].sort()

    try {
      const { error } = await supabase
        .from('medication_reminders')
        .update({ reminder_times: updatedTimes })
        .eq('id', reminderId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating reminder times:', error)
        alert('Failed to add reminder time. Please try again.')
        return
      }

      setReminders((prev) =>
        prev.map((reminder) =>
          reminder.id === reminderId ? { ...reminder, times: updatedTimes } : reminder,
        ),
      )
      setNewTime("")
    } catch (error) {
      console.error('Error updating reminder times:', error)
      alert('An unexpected error occurred. Please try again.')
    }
  }

  const removeTimeFromReminder = async (reminderId: string, timeToRemove: string) => {
    const reminder = reminders.find(r => r.id === reminderId)
    if (!reminder) return

    const updatedTimes = reminder.times.filter((time) => time !== timeToRemove)

    try {
      const { error } = await supabase
        .from('medication_reminders')
        .update({ reminder_times: updatedTimes })
        .eq('id', reminderId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating reminder times:', error)
        alert('Failed to remove reminder time. Please try again.')
        return
      }

      setReminders((prev) =>
        prev.map((reminder) =>
          reminder.id === reminderId
            ? { ...reminder, times: updatedTimes }
            : reminder,
        ),
      )
    } catch (error) {
      console.error('Error updating reminder times:', error)
      alert('An unexpected error occurred. Please try again.')
    }
  }

  const updateReminderSetting = async (reminderId: string, setting: string, value: any) => {
    // Map frontend setting names to database column names
    const dbFieldMap: { [key: string]: string } = {
      'enabled': 'is_enabled',
      'sound': 'sound_enabled',
      'vibration': 'vibration_enabled',
      'snoozeMinutes': 'snooze_minutes'
    }

    const dbField = dbFieldMap[setting] || setting

    try {
      const { error } = await supabase
        .from('medication_reminders')
        .update({ [dbField]: value })
        .eq('id', reminderId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating reminder setting:', error)
        alert('Failed to update reminder setting. Please try again.')
        return
      }

      setReminders((prev) =>
        prev.map((reminder) => (reminder.id === reminderId ? { ...reminder, [setting]: value } : reminder)),
      )
    } catch (error) {
      console.error('Error updating reminder setting:', error)
      alert('An unexpected error occurred. Please try again.')
    }
  }

  const deleteReminder = async (reminderId: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('medication_reminders')
        .delete()
        .eq('id', reminderId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting reminder:', error)
        alert('Failed to delete reminder. Please try again.')
        return
      }

      setReminders((prev) => prev.filter((reminder) => reminder.id !== reminderId))
      alert('Reminder deleted successfully!')
    } catch (error) {
      console.error('Error deleting reminder:', error)
      alert('An unexpected error occurred. Please try again.')
    }
  }

  const addNewReminder = async () => {
    if (!selectedMedicationId) return

    setIsSaving(true)
    try {
      const selectedMedication = medicationSchedules.find(med => med.id === selectedMedicationId)
      if (!selectedMedication) return

      const medicationDisplayName = `${selectedMedication.medication_name} ${selectedMedication.dosage}`

      const reminderData = {
        user_id: user.id,
        medication_schedule_id: selectedMedicationId,
        medication_name: medicationDisplayName,
        reminder_times: newReminderTime ? [newReminderTime] : [],
        is_enabled: true,
        sound_enabled: true,
        vibration_enabled: true,
        snooze_minutes: 15
      }

      const { data, error } = await supabase
        .from('medication_reminders')
        .insert([reminderData])
        .select()

      if (error) {
        console.error('Error creating reminder:', error)
        alert('Failed to create reminder. Please try again.')
        return
      }

      if (data && data[0]) {
        const newReminder: ReminderSetting = {
          id: data[0].id,
          medication: medicationDisplayName,
          times: data[0].reminder_times || [],
          enabled: data[0].is_enabled,
          sound: data[0].sound_enabled,
          vibration: data[0].vibration_enabled,
          snoozeMinutes: data[0].snooze_minutes
        }

        setReminders((prev) => [...prev, newReminder])
      }

      setSelectedMedicationId("")
      setNewReminderTime("")
      setIsAddingReminder(false)
      alert('Reminder created successfully!')
    } catch (error) {
      console.error('Error creating reminder:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Bell className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Reminder Settings</h2>
      </div>

      {isLoadingReminders ? (
        <Card className="border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600">Loading your reminders...</p>
          </CardContent>
        </Card>
      ) : reminders.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reminders set up</h3>
            <p className="text-gray-600 text-center mb-4">
              Create your first medication reminder to never miss a dose
            </p>
          </CardContent>
        </Card>
      ) : (
        reminders.map((reminder) => (
          <Card key={reminder.id} className="border-green-100">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{reminder.medication}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={reminder.enabled}
                    onCheckedChange={(checked) => updateReminderSetting(reminder.id, "enabled", checked)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteReminder(reminder.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Reminder Times */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Reminder Times</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {reminder.times.map((time) => (
                    <Badge key={time} variant="secondary" className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{time}</span>
                      <button
                        onClick={() => removeTimeFromReminder(reminder.id, time)}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="flex-1" />
                  <Button size="sm" onClick={() => addTimeToReminder(reminder.id, newTime)} disabled={!newTime}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`sound-${reminder.id}`} className="text-sm">
                    Sound
                  </Label>
                  <Switch
                    id={`sound-${reminder.id}`}
                    checked={reminder.sound}
                    onCheckedChange={(checked) => updateReminderSetting(reminder.id, "sound", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor={`vibration-${reminder.id}`} className="text-sm">
                    Vibration
                  </Label>
                  <Switch
                    id={`vibration-${reminder.id}`}
                    checked={reminder.vibration}
                    onCheckedChange={(checked) => updateReminderSetting(reminder.id, "vibration", checked)}
                  />
                </div>
              </div>

              {/* Snooze Settings */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Snooze Duration</Label>
                <Select
                  value={reminder.snoozeMinutes.toString()}
                  onValueChange={(value) => updateReminderSetting(reminder.id, "snoozeMinutes", Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <Card className="border-dashed border-2 border-gray-200">
        <CardContent className="flex items-center justify-center py-8">
          <Dialog open={isAddingReminder} onOpenChange={setIsAddingReminder}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <Plus className="w-4 h-4" />
                <span>Add New Medication Reminder</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Medication Reminder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="medication-select">Select Medication</Label>
                  <Select
                    value={selectedMedicationId}
                    onValueChange={setSelectedMedicationId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose from your scheduled medications" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingSchedules ? (
                        <SelectItem value="" disabled>Loading medications...</SelectItem>
                      ) : medicationSchedules.length === 0 ? (
                        <SelectItem value="" disabled>No medications found. Add some in the Scheduler first.</SelectItem>
                      ) : (
                        medicationSchedules.map((medication) => (
                          <SelectItem key={medication.id} value={medication.id}>
                            {medication.medication_name} {medication.dosage}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {medicationSchedules.length === 0 && !isLoadingSchedules && (
                    <p className="text-sm text-muted-foreground mt-1">
                      No medications available. Please add medications in the Scheduler first.
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="first-time">First Reminder Time (Optional)</Label>
                  <Input
                    id="first-time"
                    type="time"
                    value={newReminderTime}
                    onChange={(e) => setNewReminderTime(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddingReminder(false)} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button onClick={addNewReminder} disabled={!selectedMedicationId || isSaving}>
                    {isSaving ? "Creating..." : "Add Reminder"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
