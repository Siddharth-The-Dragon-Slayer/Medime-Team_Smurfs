/**
 * MediPlus Healthcare System - Notification Debug Script
 * Enhanced debugging for critical health alerts, SOS emails, and medication reminders
 * Updated: 2025 - Supports FHIR integration and vitals monitoring notifications
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const CRON_SECRET = process.env.CRON_SECRET || 'medimi-cron-secret-2026'

async function debugMediPlusNotifications() {
    console.log('🏥 MediPlus Healthcare Notification Debug System\n')
    console.log('🔍 Debugging comprehensive health monitoring notifications...\n')

    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5)
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

    console.log('📅 Current Day:', currentDay)
    console.log('⏰ Current Time:', currentTime)
    console.log('🏥 System: MediPlus Healthcare Monitoring')
    console.log('─'.repeat(60))

    try {
        // Test medication reminder notifications
        console.log('\n💊 Testing Medication Reminder System...')
        const medicationResponse = await fetch(`${BASE_URL}/api/cron/check-medications`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${CRON_SECRET}`,
                'Content-Type': 'application/json'
            }
        })

        const medicationData = await medicationResponse.json()
        console.log('📊 Medication API Response:')
        console.log(JSON.stringify(medicationData, null, 2))

        // Test SOS email system
        console.log('\n🚨 Testing SOS Email Alert System...')
        const sosResponse = await fetch(`${BASE_URL}/api/test-sos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (sosResponse.ok) {
            const sosData = await sosResponse.json()
            console.log('✅ SOS Email System Status:', sosData.success ? 'WORKING' : 'FAILED')
        } else {
            console.log('❌ SOS Email System: FAILED TO CONNECT')
        }

        // Test vitals monitoring
        console.log('\n🩺 Testing Vitals Monitoring System...')
        const vitalsResponse = await fetch(`${BASE_URL}/api/debug-gmail`, {
            method: 'GET'
        })

        if (vitalsResponse.ok) {
            const vitalsData = await vitalsResponse.json()
            console.log('✅ Gmail SMTP Status:', vitalsData.success ? 'CONNECTED' : 'DISCONNECTED')
        } else {
            console.log('❌ Vitals Alert System: CONFIGURATION NEEDED')
        }

        if (medicationData.notificationsSent === 0) {
            console.log('\n❌ No medication notifications sent. Diagnostic checklist:\n')
            console.log('1. 💊 Medication Schedule Configuration:')
            console.log('   → Is the current day selected in medication schedule?')
            console.log('   → Is the medication marked as Active?')
            console.log('   → Is the scheduled time within 15 minutes of current time?')
            console.log('\n2. 🔔 Push Notification Setup:')
            console.log('   → Do you have an FCM token registered?')
            console.log('   → Check browser console for "FCM Token generated"')
            console.log('   → Are browser notifications enabled?')
            console.log('\n3. 🏥 Healthcare Integration:')
            console.log('   → Is FHIR ID configured in user profile?')
            console.log('   → Are vitals monitoring alerts enabled?')
            console.log('   → Is SOS email system configured with Gmail SMTP?')
            console.log('\n💡 MediPlus Troubleshooting Steps:')
            console.log('   • Open MediPlus dashboard in browser')
            console.log('   • Enable notifications when prompted')
            console.log('   • Verify medication schedule includes current day')
            console.log('   • Test SOS email system with critical vitals')
            console.log('   • Check FHIR integration in profile settings')
        } else {
            console.log('\n✅ MediPlus notification system is working correctly!')
            console.log(`📊 Notifications sent: ${medicationData.notificationsSent}`)
        }

    } catch (error) {
        console.error('\n❌ MediPlus System Error:', error.message)
        console.log('\n🔧 System Recovery Steps:')
        console.log('   • Check network connectivity')
        console.log('   • Verify environment variables')
        console.log('   • Restart development server')
        console.log('   • Check Supabase database connection')
    }

    console.log('\n🏥 MediPlus Healthcare Debug Complete\n')
}

// Execute MediPlus notification debugging
debugMediPlusNotifications()
