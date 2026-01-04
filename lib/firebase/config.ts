import { initializeApp, getApps } from "firebase/app"
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging"

const firebaseConfig = {
    apiKey: "AIzaSyCC26_n0M1x2nd2QFBxWTkAoF9ndi08-Tk",
    authDomain: "sudinc.firebaseapp.com",
    projectId: "sudinc",
    storageBucket: "sudinc.firebasestorage.app",
    messagingSenderId: "753714604122",
    appId: "1:753714604122:web:bb64b2cd048cc815de5063",
    measurementId: "G-BFVHSKKY54"
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase Cloud Messaging
let messaging: Messaging | null = null

if (typeof window !== 'undefined') {
    messaging = getMessaging(app)
}

export { app, messaging }

// VAPID key for web push
const VAPID_KEY = "BGW7j_7FpVotWcjTwV5VeZtYkXO9JZ93LmeF0NkuIxfsUl73PmNCPYkTXMDUjo8VKmBjAbSrSi97e68Lpn02B94"

// Request notification permission and get FCM token
export const generateToken = async (): Promise<string | null> => {
    if (!messaging) {
        console.error('Messaging not initialized')
        return null
    }

    try {
        const permission = await Notification.requestPermission()
        console.log('Notification permission:', permission)

        if (permission === "granted") {
            const token = await getToken(messaging, { vapidKey: VAPID_KEY })
            console.log('FCM Token generated:', token)

            // Save token to database
            if (token) {
                try {
                    const response = await fetch('/api/notifications/subscribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token, deviceType: 'web' })
                    })

                    if (response.ok) {
                        console.log('Token saved successfully to database')
                    } else {
                        console.error('Failed to save token to database')
                    }
                } catch (error) {
                    console.error('Error saving token:', error)
                }
            }

            return token
        } else {
            console.log('Notification permission denied')
            return null
        }
    } catch (error) {
        console.error('Error generating FCM token:', error)
        return null
    }
}

// Listen for foreground messages
export const onMessageListener = () =>
    new Promise((resolve) => {
        if (!messaging) return

        onMessage(messaging, (payload) => {
            console.log('Message received in foreground:', payload)
            resolve(payload)
        })
    })

// Check if notifications are supported
export const isNotificationSupported = (): boolean => {
    return typeof window !== 'undefined' &&
        'Notification' in window &&
        'serviceWorker' in navigator
}

// Get current notification permission status
export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
    if (!isNotificationSupported()) {
        return 'unsupported'
    }
    return Notification.permission
}

// Refresh FCM token
export const refreshToken = async (): Promise<string | null> => {
    console.log('Refreshing FCM token...')
    return await generateToken()
}
