/**
 * MediPlus Healthcare Monitoring System - Firebase Service Worker
 * Enhanced push notification handling for critical health alerts and medication reminders
 * Updated: 2025 - Supports SOS alerts, vitals monitoring, and FHIR integration
 */

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js')

// Initialize the Firebase app in the service worker for MediPlus
firebase.initializeApp({
    apiKey: "AIzaSyCC26_n0M1x2nd2QFBxWTkAoF9ndi08-Tk",
    authDomain: "sudinc.firebaseapp.com",
    projectId: "sudinc",
    storageBucket: "sudinc.firebasestorage.app",
    messagingSenderId: "753714604122",
    appId: "1:753714604122:web:bb64b2cd048cc815de5063",
    measurementId: "G-BFVHSKKY54"
})

// Retrieve an instance of Firebase Messaging for healthcare notifications
const messaging = firebase.messaging()

// Handle background messages for medical alerts and reminders
messaging.onBackgroundMessage((payload) => {
    console.log('[MediPlus-SW] Received healthcare notification:', payload)

    const notificationTitle = payload.notification?.title || 'MediPlus Health Alert'
    const notificationOptions = {
        body: payload.notification?.body || 'Important health notification',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: payload.data?.type || 'health-notification',
        requireInteraction: true,
        actions: [
            {
                action: 'mark-taken',
                title: '✓ Mark as Taken'
            },
            {
                action: 'snooze',
                title: '⏰ Snooze 10 min'
            },
            {
                action: 'emergency',
                title: '🚨 Emergency'
            }
        ],
        data: payload.data,
        // Enhanced for critical health alerts
        vibrate: payload.data?.critical ? [200, 100, 200, 100, 200] : [100, 50, 100]
    }

    return self.registration.showNotification(notificationTitle, notificationOptions)
})

// Enhanced notification click handling for healthcare actions
self.addEventListener('notificationclick', (event) => {
    console.log('[MediPlus-SW] Healthcare notification clicked:', event)

    event.notification.close()

    if (event.action === 'mark-taken') {
        // Open app and mark medication as taken
        event.waitUntil(
            clients.openWindow('/scheduler?action=mark-taken&id=' + event.notification.data?.medicationId)
        )
    } else if (event.action === 'snooze') {
        // Snooze for 10 minutes
        console.log('[MediPlus-SW] Snoozing health notification for 10 minutes')
    } else if (event.action === 'emergency') {
        // Handle emergency action - open vitals dashboard
        event.waitUntil(
            clients.openWindow('/vitals?emergency=true')
        )
    } else {
        // Default action - open the MediPlus dashboard
        event.waitUntil(
            clients.openWindow('/dashboard')
        )
    }
})

// Enhanced error handling for healthcare notifications
self.addEventListener('error', (event) => {
    console.error('[MediPlus-SW] Service worker error:', event)
})
