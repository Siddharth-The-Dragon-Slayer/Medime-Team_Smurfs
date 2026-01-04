/**
 * Debug script to check why notifications aren't being sent
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const CRON_SECRET = process.env.CRON_SECRET || 'medimi-cron-secret-2026'

async function debugNotifications() {
    console.log('🔍 Debugging Notification System\n')

    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5)
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

    console.log('📅 Current Day:', currentDay)
    console.log('⏰ Current Time:', currentTime)
    console.log('─'.repeat(50))

    try {
        // Call the cron endpoint with verbose logging
        const response = await fetch(`${BASE_URL}/api/cron/check-medications`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${CRON_SECRET}`,
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()

        console.log('\n📊 API Response:')
        console.log(JSON.stringify(data, null, 2))

        if (data.notificationsSent === 0) {
            console.log('\n❌ No notifications sent. Possible reasons:\n')
            console.log('1. ❓ Is Saturday selected in your medication days?')
            console.log('2. ❓ Do you have an FCM token registered?')
            console.log('   → Check browser console for "FCM Token generated"')
            console.log('3. ❓ Was the medication already marked as taken today?')
            console.log('4. ❓ Was a notification already sent earlier today?')
            console.log('\n💡 To fix:')
            console.log('   • Open your app in the browser')
            console.log('   • Enable notifications when prompted')
            console.log('   • Check that "test" medication has Saturday checked')
            console.log('   • Make sure the medication is set to Active')
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message)
    }

    console.log('\n')
}

debugNotifications()
