/**
 * Development Testing Script for Medication Cron
 * 
 * Usage:
 *   node scripts/test-cron.js
 *   
 * Or add to package.json:
 *   "test:cron": "node scripts/test-cron.js"
 *   
 * Then run:
 *   npm run test:cron
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const CRON_SECRET = process.env.CRON_SECRET || 'medimi-cron-secret-2026'

async function testMedicationCron() {
    console.log('🔍 Testing Medication Cron Job\n')
    console.log('📍 URL:', `${BASE_URL}/api/cron/check-medications`)
    console.log('⏰ Time:', new Date().toLocaleString())
    console.log('─'.repeat(50))

    try {
        const startTime = Date.now()

        const response = await fetch(`${BASE_URL}/api/cron/check-medications`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${CRON_SECRET}`,
                'Content-Type': 'application/json'
            }
        })

        const duration = Date.now() - startTime
        const data = await response.json()

        console.log('\n📊 Response:')
        console.log('  Status:', response.status, response.statusText)
        console.log('  Duration:', duration + 'ms')
        console.log('─'.repeat(50))

        if (response.ok) {
            console.log('\n✅ Success!\n')
            console.log('  Schedules Checked:', data.schedulesChecked || 0)
            console.log('  Notifications Sent:', data.notificationsSent || 0)

            if (data.results && data.results.length > 0) {
                console.log('\n📱 Notifications:')
                data.results.forEach((result, index) => {
                    console.log(`  ${index + 1}. ${result.medication} - ${result.status}`)
                })
            } else {
                console.log('\n💤 No notifications needed at this time')
            }

            console.log('\n' + '─'.repeat(50))
            console.log('✨ Test completed successfully!')
        } else {
            console.log('\n❌ Error Response:\n')
            console.log(JSON.stringify(data, null, 2))
        }

    } catch (error) {
        console.log('\n❌ Request Failed:\n')
        console.log('  Error:', error.message)

        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Tip: Make sure your dev server is running:')
            console.log('     npm run dev')
        }
    }

    console.log('\n')
}

// Run the test
testMedicationCron()
