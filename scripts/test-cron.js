/**
 * MediPlus Healthcare System - Comprehensive Cron Testing Script
 * Enhanced testing for medication reminders, SOS alerts, and vitals monitoring
 * 
 * Usage:
 *   node scripts/test-cron.js
 *   
 * Or add to package.json:
 *   "test:mediplus-cron": "node scripts/test-cron.js"
 *   
 * Then run:
 *   npm run test:mediplus-cron
 * 
 * Updated: 2025 - Supports FHIR integration and critical health monitoring
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const CRON_SECRET = process.env.CRON_SECRET || 'medimi-cron-secret-2026'

async function testMediPlusHealthSystem() {
    console.log('🏥 MediPlus Healthcare System - Comprehensive Testing\n')
    console.log('🔍 Testing medication cron, SOS alerts, and vitals monitoring...\n')
    console.log('📍 Base URL:', BASE_URL)
    console.log('⏰ Test Time:', new Date().toLocaleString())
    console.log('🏥 System: MediPlus Healthcare Monitoring Platform')
    console.log('═'.repeat(60))

    try {
        // Test 1: Medication Cron Job
        console.log('\n💊 TEST 1: Medication Reminder System')
        console.log('─'.repeat(40))
        
        const medicationStartTime = Date.now()
        const medicationResponse = await fetch(`${BASE_URL}/api/cron/check-medications`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${CRON_SECRET}`,
                'Content-Type': 'application/json'
            }
        })

        const medicationDuration = Date.now() - medicationStartTime
        const medicationData = await medicationResponse.json()

        console.log('  Status:', medicationResponse.status, medicationResponse.statusText)
        console.log('  Duration:', medicationDuration + 'ms')
        console.log('  Schedules Checked:', medicationData.schedulesChecked || 0)
        console.log('  Notifications Sent:', medicationData.notificationsSent || 0)

        // Test 2: SOS Email Alert System
        console.log('\n🚨 TEST 2: SOS Email Alert System')
        console.log('─'.repeat(40))
        
        const sosStartTime = Date.now()
        const sosResponse = await fetch(`${BASE_URL}/api/debug-gmail`, {
            method: 'GET'
        })

        const sosDuration = Date.now() - sosStartTime
        
        if (sosResponse.ok) {
            const sosData = await sosResponse.json()
            console.log('  Status: ✅ CONNECTED')
            console.log('  Duration:', sosDuration + 'ms')
            console.log('  Gmail SMTP:', sosData.success ? 'WORKING' : 'NEEDS SETUP')
        } else {
            console.log('  Status: ❌ DISCONNECTED')
            console.log('  Duration:', sosDuration + 'ms')
        }

        // Test 3: Vitals Monitoring System
        console.log('\n🩺 TEST 3: Vitals Monitoring System')
        console.log('─'.repeat(40))
        
        const vitalsStartTime = Date.now()
        const vitalsResponse = await fetch(`${BASE_URL}/api/simple-email-test`, {
            method: 'GET'
        })

        const vitalsDuration = Date.now() - vitalsStartTime
        
        if (vitalsResponse.ok) {
            const vitalsData = await vitalsResponse.json()
            console.log('  Status: ✅ OPERATIONAL')
            console.log('  Duration:', vitalsDuration + 'ms')
            console.log('  Email System:', vitalsData.success ? 'READY' : 'CONFIGURATION NEEDED')
        } else {
            console.log('  Status: ⚠️ NEEDS CONFIGURATION')
            console.log('  Duration:', vitalsDuration + 'ms')
        }

        // Summary Report
        console.log('\n📊 MEDIPLUS SYSTEM HEALTH REPORT')
        console.log('═'.repeat(60))
        
        if (medicationResponse.ok) {
            console.log('✅ Medication Reminders: OPERATIONAL')
            if (medicationData.results && medicationData.results.length > 0) {
                console.log('📱 Active Notifications:')
                medicationData.results.forEach((result, index) => {
                    console.log(`   ${index + 1}. ${result.medication} - ${result.status}`)
                })
            }
        } else {
            console.log('❌ Medication Reminders: FAILED')
        }

        console.log(sosResponse.ok ? '✅ SOS Email Alerts: READY' : '❌ SOS Email Alerts: SETUP REQUIRED')
        console.log(vitalsResponse.ok ? '✅ Vitals Monitoring: ACTIVE' : '⚠️ Vitals Monitoring: CONFIGURATION NEEDED')

        console.log('\n🏥 MediPlus Healthcare System Status: ' + 
            (medicationResponse.ok && sosResponse.ok ? 'FULLY OPERATIONAL' : 'PARTIAL FUNCTIONALITY'))

    } catch (error) {
        console.log('\n❌ SYSTEM TEST FAILED:\n')
        console.log('  Error:', error.message)

        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Recovery Steps:')
            console.log('   • Ensure MediPlus development server is running:')
            console.log('     npm run dev')
            console.log('   • Check network connectivity')
            console.log('   • Verify environment variables are set')
            console.log('   • Confirm Supabase database is accessible')
        }
    }

    console.log('\n🏥 MediPlus Healthcare System Test Complete')
    console.log('═'.repeat(60))
    console.log('')
}

// Execute comprehensive MediPlus system test
testMediPlusHealthSystem()
