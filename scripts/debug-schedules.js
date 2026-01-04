/**
 * Debug Script to Check Medication Schedules
 * This helps identify why notifications aren't being sent
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

async function debugSchedules() {
    console.log('🔍 Debugging Medication Schedules\n')

    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

    console.log('📅 Current Day:', currentDay)
    console.log('⏰ Current Time:', currentTime)
    console.log('🕐 Full Time:', now.toLocaleString())
    console.log('─'.repeat(50))

    try {
        // Fetch all schedules to see what's in the database
        const response = await fetch(`${BASE_URL}/api/debug/schedules`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            console.log('\n❌ API endpoint not found. Let me check the database directly...\n')
            console.log('💡 To fix this, you need to:')
            console.log('   1. Check your medication schedule in the app')
            console.log('   2. Verify the "test" medication has:')
            console.log(`      - Time: ${currentTime} (current time)`)
            console.log(`      - Day: ${currentDay} is checked`)
            console.log('   3. Make sure you have an FCM token registered')
            return
        }

        const data = await response.json()
        console.log('\n📊 Database Schedules:\n')
        console.log(JSON.stringify(data, null, 2))

    } catch (error) {
        console.log('\n❌ Error:', error.message)
        console.log('\n💡 Quick Checklist:')
        console.log('   ✓ Is your dev server running? (npm run dev)')
        console.log('   ✓ Did you create the "test" medication?')
        console.log(`   ✓ Is it scheduled for ${currentDay}?`)
        console.log(`   ✓ Is the time set to ${currentTime}?`)
        console.log('   ✓ Do you have notification permissions enabled?')
    }

    console.log('\n')
}

debugSchedules()
