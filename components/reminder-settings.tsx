"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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

export function ReminderSettings() {
  const [reminders, setReminders] = useState<ReminderSetting[]>([
    {
      id: "1",
      medication: "Lisinopril 10mg",
      times: ["09:00", "21:00"],
      enabled: true,
      sound: true,
      vibration: true,
      snoozeMinutes: 15,
    },
    {
      id: "2",
      medication: "Metformin 500mg",
      times: ["08:00", "20:00"],
      enabled: true,
      sound: false,
      vibration: true,
      snoozeMinutes: 10,
    },
  ])

  const [newTime, setNewTime] = useState("")

  const addTimeToReminder = (reminderId: string, time: string) => {
    if (!time) return

    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === reminderId ? { ...reminder, times: [...reminder.times, time].sort() } : reminder,
      ),
    )
    setNewTime("")
  }

  const removeTimeFromReminder = (reminderId: string, timeToRemove: string) => {
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === reminderId
          ? { ...reminder, times: reminder.times.filter((time) => time !== timeToRemove) }
          : reminder,
      ),
    )
  }

  const updateReminderSetting = (reminderId: string, setting: string, value: any) => {
    setReminders((prev) =>
      prev.map((reminder) => (reminder.id === reminderId ? { ...reminder, [setting]: value } : reminder)),
    )
  }

  const deleteReminder = (reminderId: string) => {
    setReminders((prev) => prev.filter((reminder) => reminder.id !== reminderId))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Bell className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Reminder Settings</h2>
      </div>

      {reminders.map((reminder) => (
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
      ))}

      <Card className="border-dashed border-2 border-gray-200">
        <CardContent className="flex items-center justify-center py-8">
          <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
            <Plus className="w-4 h-4" />
            <span>Add New Medication Reminder</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
