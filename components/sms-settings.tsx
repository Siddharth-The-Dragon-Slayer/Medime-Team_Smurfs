"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MessageSquare, Phone, Send, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { useSMSReminders } from "@/hooks/use-sms-reminders"

interface SMSSettingsProps {
  user: any
}

export function SMSSettings({ user }: SMSSettingsProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [smsEnabled, setSmsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [testMedication, setTestMedication] = useState("Aspirin 100mg")
  const [smsLogs, setSmsLogs] = useState<any[]>([])
  
  const { sendTestSMS, getSMSLogs, updatePhoneNumber, isSending } = useSMSReminders()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    if (user?.id) {
      loadUserProfile()
      loadSMSLogs()
    }
  }, [user?.id])

  const loadUserProfile = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error)
        return
      }

      if (data?.phone) {
        setPhoneNumber(data.phone)
        setSmsEnabled(true)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSMSLogs = async () => {
    try {
      const logs = await getSMSLogs()
      setSmsLogs(logs.slice(0, 5)) // Show last 5 SMS logs
    } catch (error) {
      console.error('Error loading SMS logs:', error)
    }
  }

  const handleSavePhoneNumber = async () => {
    if (!phoneNumber.trim()) {
      alert('Please enter a valid phone number')
      return
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    if (!phoneRegex.test(phoneNumber)) {
      alert('Please enter a valid phone number (e.g., +1234567890)')
      return
    }

    setIsSaving(true)
    try {
      await updatePhoneNumber(phoneNumber)
      setSmsEnabled(true)
      alert('Phone number saved successfully!')
    } catch (error) {
      console.error('Error saving phone number:', error)
      alert('Failed to save phone number. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestSMS = async () => {
    if (!phoneNumber) {
      alert('Please save your phone number first')
      return
    }

    try {
      await sendTestSMS(phoneNumber, testMedication)
      alert('Test SMS sent successfully! Check your phone.')
      setShowTestDialog(false)
      // Reload SMS logs to show the test message
      setTimeout(loadSMSLogs, 1000)
    } catch (error) {
      console.error('Error sending test SMS:', error)
      alert('Failed to send test SMS. Please check your phone number and try again.')
    }
  }

  const formatPhoneNumber = (phone: string) => {
    // Simple phone number formatting for display
    if (phone.startsWith('+1') && phone.length === 12) {
      return `${phone.slice(0, 2)} (${phone.slice(2, 5)}) ${phone.slice(5, 8)}-${phone.slice(8)}`
    }
    return phone
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading SMS settings...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">SMS Reminder Settings</h2>
      </div>

      {/* Phone Number Setup */}
      <Card className="border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Phone Number Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleSavePhoneNumber}
                disabled={isSaving || !phoneNumber.trim()}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Include country code (e.g., +1 for US, +44 for UK)
            </p>
          </div>

          {smsEnabled && phoneNumber && (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800">SMS reminders enabled</span>
              </div>
              <Badge variant="secondary">
                {formatPhoneNumber(phoneNumber)}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test SMS */}
      {smsEnabled && (
        <Card className="border-green-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Test SMS Reminder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Send a test SMS to verify your phone number is working correctly.
            </p>
            <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Send className="w-4 h-4 mr-2" />
                  Send Test SMS
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Test SMS</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="test-medication">Test Medication Name</Label>
                    <Input
                      id="test-medication"
                      value={testMedication}
                      onChange={(e) => setTestMedication(e.target.value)}
                      placeholder="e.g., Aspirin 100mg"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowTestDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleTestSMS} disabled={isSending}>
                      {isSending ? "Sending..." : "Send Test SMS"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* SMS History */}
      {smsLogs.length > 0 && (
        <Card className="border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent SMS History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {smsLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log.status)}
                    <div>
                      <p className="text-sm font-medium">
                        {log.message.includes('Test') ? 'Test SMS' : 'Medication Reminder'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.sent_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={log.status === 'sent' ? 'default' : log.status === 'failed' ? 'destructive' : 'secondary'}>
                    {log.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card className="border-yellow-100 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">SMS Reminder Information</h4>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• SMS reminders are sent automatically at your scheduled times</li>
                <li>• Standard messaging rates may apply from your carrier</li>
                <li>• You can disable SMS for individual reminders in the reminder settings</li>
                <li>• Reply STOP to any message to unsubscribe from all SMS reminders</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}