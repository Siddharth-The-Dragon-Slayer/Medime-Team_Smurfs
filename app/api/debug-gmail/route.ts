import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debugging Gmail SMTP Configuration...')
    
    const gmailUser = process.env.GMAIL_USER
    const gmailPassword = process.env.GMAIL_APP_PASSWORD
    
    console.log('📧 Gmail User:', gmailUser)
    console.log('🔑 Gmail Password length:', gmailPassword?.length)
    console.log('🔑 Gmail Password format:', gmailPassword?.replace(/./g, '*'))
    
    // Check if credentials are configured
    if (!gmailUser || gmailUser === 'your-email@gmail.com') {
      return NextResponse.json({
        error: 'Gmail user not configured',
        gmailUser: gmailUser || 'undefined',
        message: 'Please set GMAIL_USER in .env.local'
      })
    }
    
    if (!gmailPassword || gmailPassword === 'your-app-password') {
      return NextResponse.json({
        error: 'Gmail app password not configured',
        passwordLength: gmailPassword?.length || 0,
        message: 'Please set GMAIL_APP_PASSWORD in .env.local'
      })
    }
    
    // Check password format
    if (gmailPassword.length !== 16) {
      return NextResponse.json({
        error: 'Invalid Gmail app password format',
        passwordLength: gmailPassword.length,
        expectedLength: 16,
        message: 'Gmail app passwords should be exactly 16 characters long (like: abcd efgh ijkl mnop without spaces)'
      })
    }
    
    // Test SMTP connection
    console.log('🔌 Testing SMTP connection...')
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    })
    
    // Verify connection
    const isConnected = await transporter.verify()
    
    if (isConnected) {
      console.log('✅ SMTP connection successful!')
      
      // Try sending a test email
      const testResult = await transporter.sendMail({
        from: {
          name: 'MediMe Test System',
          address: gmailUser
        },
        to: gmailUser, // Send to yourself for testing
        subject: '🧪 Gmail SMTP Test - Success!',
        text: 'This is a test email to verify Gmail SMTP is working correctly.',
        html: `
          <h2>🧪 Gmail SMTP Test - Success!</h2>
          <p>This is a test email to verify Gmail SMTP is working correctly.</p>
          <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>From:</strong> MediMe Health Alert System</p>
        `
      })
      
      return NextResponse.json({
        success: true,
        message: 'Gmail SMTP is working correctly!',
        details: {
          gmailUser,
          passwordLength: gmailPassword.length,
          smtpConnected: true,
          testEmailSent: true,
          messageId: testResult.messageId
        }
      })
    } else {
      return NextResponse.json({
        error: 'SMTP connection failed',
        details: {
          gmailUser,
          passwordLength: gmailPassword.length,
          smtpConnected: false
        }
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('❌ Gmail SMTP Error:', error)
    
    let errorMessage = 'Unknown error'
    let errorCode = error.code
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed. Check your Gmail credentials.'
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Network error. Check your internet connection.'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json({
      error: 'Gmail SMTP test failed',
      errorCode,
      errorMessage,
      details: {
        gmailUser: process.env.GMAIL_USER,
        passwordLength: process.env.GMAIL_APP_PASSWORD?.length || 0,
        fullError: error.toString()
      }
    }, { status: 500 })
  }
}