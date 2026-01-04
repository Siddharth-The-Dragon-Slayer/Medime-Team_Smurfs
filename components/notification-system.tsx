"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, X, Clock, Pill, CheckCircle } from "lucide-react"

interface Notification {
  id: string
  type: "medication" | "appointment" | "refill"
  title: string
  message: string
  time: string
  medication?: string
  dosage?: string
  urgent?: boolean
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "medication",
      title: "Time for Medication",
      message: "Take your morning dose of Lisinopril",
      time: "9:00 AM",
      medication: "Lisinopril",
      dosage: "10mg",
      urgent: true,
    },
    {
      id: "2",
      type: "refill",
      title: "Prescription Refill Due",
      message: "Your Metformin prescription expires in 3 days",
      time: "2 days ago",
      medication: "Metformin",
      urgent: false,
    },
    {
      id: "3",
      type: "appointment",
      title: "Upcoming Appointment",
      message: "Doctor visit scheduled for tomorrow at 2:00 PM",
      time: "Tomorrow",
      urgent: false,
    },
  ])
  const [showNotifications, setShowNotifications] = useState(false)

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const markAsTaken = (id: string) => {
    // In a real app, this would update the medication log
    dismissNotification(id)
  }

  const urgentCount = notifications.filter((n) => n.urgent).length

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setShowNotifications(!showNotifications)} className="relative">
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <Badge
            variant={urgentCount > 0 ? "destructive" : "secondary"}
            className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
          >
            {notifications.length}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <div className="absolute right-0 top-12 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowNotifications(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b last:border-b-0 ${
                    notification.urgent ? "bg-red-50 border-l-4 border-l-red-500" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {notification.type === "medication" && <Pill className="w-4 h-4 text-blue-500" />}
                        {notification.type === "appointment" && <Clock className="w-4 h-4 text-green-500" />}
                        {notification.type === "refill" && <Bell className="w-4 h-4 text-orange-500" />}
                        <span className="font-medium text-sm">{notification.title}</span>
                        {notification.urgent && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      {notification.medication && (
                        <div className="text-xs text-gray-500 mb-2">
                          {notification.medication} {notification.dosage && `- ${notification.dosage}`}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">{notification.time}</div>
                    </div>
                    <div className="flex flex-col space-y-1 ml-2">
                      {notification.type === "medication" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsTaken(notification.id)}
                          className="text-xs"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Taken
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissNotification(notification.id)}
                        className="text-xs"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
