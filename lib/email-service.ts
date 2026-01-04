import nodemailer from 'nodemailer'

interface SOSEmailData {
  userEmail: string
  userName: string
  temperature?: number
  heartRate?: number
  timestamp: string
  alertType: 'temperature' | 'heartRate' | 'both'
}

// Create Gmail SMTP transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Your Gmail address
      pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not regular password)
    },
  })
}

// Generate SOS email content based on alert type
const generateSOSEmailContent = (data: SOSEmailData) => {
  const { userName, temperature, heartRate, timestamp, alertType } = data
  
  let subject = '🚨 CRITICAL HEALTH ALERT - Immediate Attention Required'
  let alertDetails = ''
  
  if (alertType === 'temperature' && temperature) {
    if (temperature > 38.0) {
      alertDetails = `🌡️ HIGH FEVER DETECTED: ${temperature}°C (Normal: 35.5-37.5°C)`
    } else if (temperature < 35.5) {
      alertDetails = `🧊 HYPOTHERMIA DETECTED: ${temperature}°C (Normal: 35.5-37.5°C)`
    }
  } else if (alertType === 'heartRate' && heartRate) {
    if (heartRate > 120) {
      alertDetails = `💓 TACHYCARDIA DETECTED: ${heartRate} BPM (Normal: 60-100 BPM)`
    } else if (heartRate < 50) {
      alertDetails = `💔 BRADYCARDIA DETECTED: ${heartRate} BPM (Normal: 60-100 BPM)`
    }
  } else if (alertType === 'both') {
    alertDetails = `🚨 MULTIPLE CRITICAL VITALS:\n`
    if (temperature) {
      alertDetails += `   🌡️ Temperature: ${temperature}°C\n`
    }
    if (heartRate) {
      alertDetails += `   💓 Heart Rate: ${heartRate} BPM\n`
    }
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Critical Health Alert</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .alert-header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .alert-body { background: #fef2f2; border: 2px solid #dc2626; padding: 20px; border-radius: 0 0 8px 8px; }
        .vital-reading { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #dc2626; }
        .timestamp { color: #666; font-size: 14px; }
        .action-required { background: #fee2e2; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="alert-header">
          <h1>🚨 CRITICAL HEALTH ALERT</h1>
          <p>Immediate Medical Attention Required</p>
        </div>
        
        <div class="alert-body">
          <h2>Dear ${userName},</h2>
          
          <p><strong>Your MediMe health monitoring system has detected critical vital signs that require immediate attention.</strong></p>
          
          <div class="vital-reading">
            <h3>⚠️ Critical Reading Detected:</h3>
            <p>${alertDetails}</p>
            <p class="timestamp">📅 Time: ${timestamp}</p>
          </div>
          
          <div class="action-required">
            <h3>🏥 IMMEDIATE ACTION REQUIRED:</h3>
            <ul>
              <li><strong>Seek immediate medical attention</strong></li>
              <li>Contact your healthcare provider or emergency services</li>
              <li>Do not ignore these symptoms</li>
              <li>Keep monitoring your vitals</li>
            </ul>
          </div>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <h4>📞 Emergency Contacts:</h4>
            <p>🚑 Emergency Services: 911 (US) / 999 (UK) / 112 (EU)</p>
            <p>🏥 Your Doctor: Contact your primary healthcare provider</p>
            <p>☎️ Poison Control: 1-800-222-1222 (if applicable)</p>
          </div>
          
          <p><strong>This is an automated alert from your MediMe health monitoring system. Please take this seriously and seek appropriate medical care.</strong></p>
        </div>
        
        <div class="footer">
          <p>This email was sent by MediMe Health Monitoring System</p>
          <p>If you believe this is an error, please check your device readings and consult with a healthcare professional.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
🚨 CRITICAL HEALTH ALERT - IMMEDIATE ATTENTION REQUIRED

Dear ${userName},

Your MediMe health monitoring system has detected critical vital signs:

${alertDetails}
Time: ${timestamp}

IMMEDIATE ACTION REQUIRED:
- Seek immediate medical attention
- Contact your healthcare provider or emergency services  
- Do not ignore these symptoms
- Keep monitoring your vitals

Emergency Contacts:
🚑 Emergency Services: 911 (US) / 999 (UK) / 112 (EU)
🏥 Your Doctor: Contact your primary healthcare provider

This is an automated alert from your MediMe health monitoring system.
Please take this seriously and seek appropriate medical care.
  `

  return { subject, htmlContent, textContent }
}

// Send SOS email
export const sendSOSEmail = async (data: SOSEmailData): Promise<boolean> => {
  try {
    const transporter = createTransporter()
    const { subject, htmlContent, textContent } = generateSOSEmailContent(data)

    const mailOptions = {
      from: {
        name: 'MediMe Health Alert System',
        address: process.env.GMAIL_USER!
      },
      to: data.userEmail,
      subject,
      text: textContent,
      html: htmlContent,
      priority: 'high',
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('SOS Email sent successfully:', result.messageId)
    return true
  } catch (error) {
    console.error('Failed to send SOS email:', error)
    return false
  }
}

// Check if vitals are critical
export const checkCriticalVitals = (temperature: number, heartRate: number) => {
  const isTempCritical = temperature > 38.0 || temperature < 35.5
  const isHeartRateCritical = heartRate > 120 || heartRate < 50
  
  let alertType: 'temperature' | 'heartRate' | 'both' | null = null
  
  if (isTempCritical && isHeartRateCritical) {
    alertType = 'both'
  } else if (isTempCritical) {
    alertType = 'temperature'
  } else if (isHeartRateCritical) {
    alertType = 'heartRate'
  }
  
  return {
    isCritical: isTempCritical || isHeartRateCritical,
    alertType,
    isTempCritical,
    isHeartRateCritical
  }
}