"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export interface VitalSigns {
  id?: string
  user_id?: string
  temperature_celsius?: number
  heart_rate_bpm?: number
  oxygen_level_percent?: number
  humidity_percent?: number
  blood_pressure_systolic?: number
  blood_pressure_diastolic?: number
  recorded_at?: string
}

export function useVitals() {
  const [vitals, setVitals] = useState<VitalSigns[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Fetch initial vitals data
  useEffect(() => {
    fetchVitals()
  }, [])

  // Set up real-time subscription
  useEffect(() => {
    let channel: any = null

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      channel = supabase
        .channel('vitals-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'vitals',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Vitals change received:', payload)
            if (payload.eventType === 'INSERT') {
              setVitals(prev => [payload.new as VitalSigns, ...prev.slice(0, 19)])
            }
          }
        )
        .subscribe()
    }

    setupSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [supabase])

  const fetchVitals = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('vitals')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setVitals(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const addVitalSigns = async (vitalData: Omit<VitalSigns, 'id' | 'recorded_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('vitals')
        .insert([{
          ...vitalData,
          user_id: user.id,
          recorded_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error
      return data?.[0]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add vital signs')
      throw err
    }
  }

  const getLatestVitals = () => {
    return vitals[0] || null
  }

  return {
    vitals,
    loading,
    error,
    addVitalSigns,
    getLatestVitals,
    refetch: fetchVitals
  }
}