"use client"

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { generateToken, isNotificationSupported, getNotificationPermission } from '@/lib/firebase/config'

export function usePushNotifications() {
    const [token, setToken] = useState<string | null>(null)
    const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Check initial permission status
        setPermission(getNotificationPermission())

        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/firebase-messaging-sw.js')
                .then((registration) => {
                    console.log('Service Worker registered:', registration)
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error)
                })
        }

        // Listen for foreground messages
        if (isNotificationSupported()) {
            (async () => {
                const { messaging } = await import('@/lib/firebase/config')
                const { onMessage } = await import('firebase/messaging')

                if (messaging) {
                    onMessage(messaging, (payload: any) => {
                        console.log('Foreground message received:', payload)

                        // Show toast notification with app theme
                        const title = payload.notification?.title || 'Medication Reminder'
                        const body = payload.notification?.body || 'Time to take your medication'

                        console.log('Showing toast notification:', { title, body })

                        // Check if dark mode is active
                        const isDark = document.documentElement.classList.contains('dark')

                        // Show toast with custom styling
                        toast(`💊 ${title}`, {
                            description: body,
                            duration: 5000,
                            classNames: {
                                toast: isDark ? 'medication-toast-dark' : 'medication-toast-light',
                            },
                        })

                        console.log('Toast called successfully')
                    })
                }
            })()
        }
    }, [])

    const requestPermission = async () => {
        if (!isNotificationSupported()) {
            setError('Notifications are not supported in this browser')
            return false
        }

        setIsLoading(true)
        setError(null)

        try {
            const fcmToken = await generateToken()

            if (fcmToken) {
                setToken(fcmToken)
                setPermission('granted')
                return true
            } else {
                setPermission('denied')
                setError('Failed to get notification permission')
                return false
            }
        } catch (err) {
            console.error('Error requesting permission:', err)
            setError('An error occurred while requesting permission')
            return false
        } finally {
            setIsLoading(false)
        }
    }

    return {
        token,
        permission,
        isLoading,
        error,
        requestPermission,
        isSupported: isNotificationSupported()
    }
}
