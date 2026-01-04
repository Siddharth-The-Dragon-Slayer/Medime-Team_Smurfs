"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, X } from 'lucide-react'
import { usePushNotifications } from '@/hooks/use-push-notifications'

export function NotificationPermissionBanner() {
    const [isVisible, setIsVisible] = useState(false)
    const { permission, requestPermission, isLoading, isSupported } = usePushNotifications()

    useEffect(() => {
        // Show banner if notifications are supported but not granted
        if (isSupported && permission === 'default') {
            // Check if user previously dismissed the banner
            const dismissed = localStorage.getItem('notification-banner-dismissed')
            if (!dismissed) {
                setIsVisible(true)
            }
        } else {
            // Hide banner if permission is granted or denied
            setIsVisible(false)
        }
    }, [isSupported, permission])

    const handleEnable = async () => {
        const success = await requestPermission()
        if (success) {
            setIsVisible(false)
        }
    }

    const handleDismiss = () => {
        setIsVisible(false)
        localStorage.setItem('notification-banner-dismissed', 'true')
    }

    if (!isVisible || !isSupported) {
        return null
    }

    return (
        <Card className="border-blue-200 bg-blue-50 mb-6">
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bell className="w-5 h-5 text-blue-600" />
                    </div>

                    <div className="flex-1">
                        <h3 className="font-semibold text-blue-900 mb-1">
                            Enable Medication Reminders
                        </h3>
                        <p className="text-sm text-blue-700 mb-3">
                            Get timely notifications to never miss your medications. We'll send you reminders at your scheduled times.
                        </p>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleEnable}
                                disabled={isLoading}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isLoading ? 'Enabling...' : 'Enable Notifications'}
                            </Button>
                            <Button
                                onClick={handleDismiss}
                                variant="outline"
                                size="sm"
                                className="border-blue-300"
                            >
                                Maybe Later
                            </Button>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDismiss}
                        className="flex-shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
