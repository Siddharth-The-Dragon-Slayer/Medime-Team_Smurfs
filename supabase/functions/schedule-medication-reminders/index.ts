import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get current time
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' })

    console.log(`Checking for reminders at ${currentTime} on ${currentDay}`)

    // Get all active reminders that should trigger now
    const { data: reminders, error: remindersError } = await supabaseClient
      .from('medication_reminders')
      .select(`
        *,
        profiles!inner(phone, name)
      `)
      .eq('is_enabled', true)
      .contains('reminder_times', [currentTime])

    if (remindersError) {
      console.error('Error fetching reminders:', remindersError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch reminders' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${reminders?.length || 0} reminders to process`)

    const results = []

    for (const reminder of reminders || []) {
      try {
        const profile = reminder.profiles
        
        if (!profile?.phone) {
          console.log(`No phone number for user ${reminder.user_id}`)
          continue
        }

        // Create personalized message
        const message = `🏥 MediMe Reminder: Time to take your ${reminder.medication_name}. 
        
Don't forget to take your medication as prescribed. 
        
Reply STOP to unsubscribe.`

        // Send SMS using the send-medication-sms function
        const smsResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-medication-sms`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: profile.phone,
            message: message,
            reminderId: reminder.id
          })
        })

        const smsResult = await smsResponse.json()
        
        if (smsResponse.ok) {
          results.push({
            reminderId: reminder.id,
            medication: reminder.medication_name,
            phone: profile.phone,
            status: 'sent',
            messageSid: smsResult.messageSid
          })
          console.log(`SMS sent successfully for reminder ${reminder.id}`)
        } else {
          results.push({
            reminderId: reminder.id,
            medication: reminder.medication_name,
            phone: profile.phone,
            status: 'failed',
            error: smsResult.error
          })
          console.error(`Failed to send SMS for reminder ${reminder.id}:`, smsResult.error)
        }

      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error)
        results.push({
          reminderId: reminder.id,
          status: 'error',
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: results.length,
        results: results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in schedule-medication-reminders:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})