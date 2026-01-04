import admin from 'firebase-admin'

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        })
        console.log('Firebase Admin initialized successfully')
    } catch (error) {
        console.error('Firebase admin initialization error:', error)
    }
}

export const firebaseAdmin = admin

// Send notification to a single device
export async function sendNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>
) {
    try {
        const message = {
            notification: {
                title,
                body,
            },
            data: data || {},
            token,
        }

        const response = await admin.messaging().send(message)
        console.log('Successfully sent message:', response)
        return { success: true, response }
    } catch (error) {
        console.error('Error sending message:', error)
        return { success: false, error }
    }
}

// Send notification to multiple devices
export async function sendNotificationToMultiple(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>
) {
    try {
        const message = {
            notification: {
                title,
                body,
            },
            data: data || {},
            tokens,
        }

        const response = await admin.messaging().sendEachForMulticast(message)
        console.log(`Successfully sent ${response.successCount} messages`)

        if (response.failureCount > 0) {
            console.error(`Failed to send ${response.failureCount} messages`)
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    console.error(`Failed to send to token ${tokens[idx]}:`, resp.error)
                }
            })
        }

        return { success: true, response }
    } catch (error) {
        console.error('Error sending messages:', error)
        return { success: false, error }
    }
}
