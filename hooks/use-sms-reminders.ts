"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function useSMSReminders() {
  const [isSending, setIsSending] = useState(false)
  const supabase = createClient()

  const sendTestSMS = async (phoneNumber: string, medicationName: string) => {
    setIsSending(true)
    try {
      const message = `🏥 MediMe Test: This is a test reminder for ${medicationName}. Your medication reminders are working correctly!`

      const { data, error } = await supabase.functions.invoke('send-medication-sms', {
        body: {
          to: phoneNumber,
          message: message
        }
      })

      if (error) {
        throw error
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error sending test SMS:', error)
      throw error
    } finally {
      setIsSending(false)
    }
  }

  const getSMSLogs = async (reminderId?: string) => {
    try {
      let query = supabase
        .from('sms_logs')
        .select('*')
        .order('sent_at', { ascending: false })

      if (reminderId) {
        query = query.eq('reminder_id', reminderId)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching SMS logs:', error)
      throw error
    }
  }

  const updatePhoneNumber = async (phoneNumber: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({ phone: phoneNumber })
        .eq('id', user.id)

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating phone number:', error)
      throw error
    }
  }

  return {
    sendTestSMS,
    getSMSLogs,
    updatePhoneNumber,
    isSending
  }
}