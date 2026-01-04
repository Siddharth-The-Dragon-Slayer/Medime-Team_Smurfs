import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
    try {
        const { token, deviceType } = await request.json()

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 })
        }

        // Create Supabase client
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    },
                },
            }
        )

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if token already exists
        const { data: existingToken } = await supabase
            .from('fcm_tokens')
            .select('*')
            .eq('token', token)
            .single()

        if (existingToken) {
            // Update existing token
            const { error: updateError } = await supabase
                .from('fcm_tokens')
                .update({
                    user_id: user.id,
                    device_type: deviceType || 'web',
                    updated_at: new Date().toISOString()
                })
                .eq('token', token)

            if (updateError) {
                console.error('Error updating FCM token:', updateError)
                return NextResponse.json({ error: 'Failed to update token' }, { status: 500 })
            }

            return NextResponse.json({ message: 'Token updated successfully' })
        } else {
            // Insert new token
            const { error: insertError } = await supabase
                .from('fcm_tokens')
                .insert({
                    user_id: user.id,
                    token,
                    device_type: deviceType || 'web'
                })

            if (insertError) {
                console.error('Error saving FCM token:', insertError)
                return NextResponse.json({ error: 'Failed to save token' }, { status: 500 })
            }

            return NextResponse.json({ message: 'Token saved successfully' })
        }
    } catch (error) {
        console.error('Error in subscribe endpoint:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
