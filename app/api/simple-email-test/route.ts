import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function GET() {
  try {
    console.log('🧪 Simple Email Test Starting...')
    
    const gmailUser = process.env.GMAIL_USER
    const gmailPassword = process.env.GMAIL_APP_PASSWORD
    
    console.log('📧 Gmail User:', gmailUser)
    console.log('🔑 Password Length:', gmailPassword?.length)
    console.log('🔑 Password (masked):', gmailPassword?.replace(/./g, '*'))
    
    if (!gmailUser || !gmailPassword) {
      return NextResponse.json({
        error: 'Missing credentials',
        gmailUser: gmailUser || 'undefined',
        passwordSet: !!gmailPassword
      })
    }
    
    console.log('🔌 Creating transporter...')
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
      debug: true, // Enable debug logging
      logger: true // Enable logging
    })
    
    console.log('✅ Transporter created, testing connection...')
    
    // Test connection first
    const verified = await transporter.verify()
    console.log('🔌 Connection verified:', verified)
    
    if (!verified) {
      return NextResponse.json({
        error: 'SMTP connection failed',
        details: 'Could not connect to Gmail SMTP server'
      }, { status: 500 })
    }
    
    console.log('📧 Sending test email...')
    
    const info = await transporter.sendMail({
      from: gmailUser,
      to: gmailUser, // Send to yourself
      subject: '🧪 Simple Email Test',
      text: 'This is a simple test email to verify SMTP is working.',
      html: '<h2>🧪 Simple Email Test</h2><p>This is a simple test email to verify SMTP is working.</p>'
    })
    
    console.log('✅ Email sent successfully:', info.messageId)
    
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully!',
      messageId: info.messageId,
      details: {
        from: gmailUser,
        to: gmailUser,
        verified: true
      }
    })
    
  } catch (error: any) {
    console.error('❌ Email test failed:', error)
    
    return NextResponse.json({
      error: 'Email test failed',
      message: error.message,
      code: error.code,
      details: {
        gmailUser: process.env.GMAIL_USER,
        passwordLength: process.env.GMAIL_APP_PASSWORD?.length,
        errorType: error.constructor.name
      }
    }, { status: 500 })
  }
}