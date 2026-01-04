importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js')

// Initialize the Firebase app in the service worker
firebase.initializeApp({
    apiKey: "AIzaSyCC26_n0M1x2nd2QFBxWTkAoF9ndi08-Tk",
    authDomain: "sudinc.firebaseapp.com",
    projectId: "sudinc",
    storageBucket: "sudinc.firebasestorage.app",
    messagingSenderId: "753714604122",
    appId: "1:753714604122:web:bb64b2cd048cc815de5063",
    measurementId: "G-BFVHSKKY54"
})

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload)

    const notificationTitle = payload.notification?.title || 'Medication Reminder'
    const notificationOptions = {
        body: payload.notification?.body || 'Time to take your medication',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'medication-reminder',
        requireInteraction: true,
        actions: [
            {
                action: 'mark-taken',
                title: 'Mark as Taken'
            },
            {
                action: 'snooze',
                title: 'Snooze 10 min'
            }
        ],
        data: payload.data
    }

    return self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked:', event)

    event.notification.close()

    if (event.action === 'mark-taken') {
        // Open app and mark medication as taken
        event.waitUntil(
            clients.openWindow('/scheduler?action=mark-taken&id=' + event.notification.data?.medicationId)
        )
    } else if (event.action === 'snooze') {
        // Snooze for 10 minutes
        console.log('Snoozing notification for 10 minutes')
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/scheduler')
        )
    }
})
