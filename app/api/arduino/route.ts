import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get Arduino IP from environment variable or use default
    const arduinoIP = process.env.ARDUINO_IP_ADDRESS || '192.168.1.100'
    const arduinoURL = `http://${arduinoIP}/data`
    
    // Fetch data from Arduino with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    const response = await fetch(arduinoURL, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`Arduino responded with status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Transform Arduino data to dashboard format
    // Arduino provides: { temperature, heartbeat, timestamp }
    // Convert heartbeat analog value (0-1023) to estimated BPM (60-100)
    const heartRateBPM = Math.floor(60 + (data.heartbeat / 1023) * 40)
    
    const transformedData = {
      temperature: parseFloat(data.temperature) || 0,
      heartRate: heartRateBPM,
      // Arduino doesn't provide these, so we'll use reasonable defaults
      oxygenLevel: 98, // Default value
      humidity: 45, // Default value
      timestamp: new Date().toISOString(),
      arduinoTimestamp: data.timestamp,
      connected: true,
      source: 'arduino'
    }
    
    return NextResponse.json(transformedData)
    
  } catch (error: any) {
    console.error('Arduino connection error:', error.message)
    
    // Return error response with disconnected status
    return NextResponse.json(
      {
        temperature: 0,
        heartRate: 0,
        oxygenLevel: 0,
        humidity: 0,
        timestamp: new Date().toISOString(),
        connected: false,
        error: error.name === 'AbortError' ? 'Connection timeout' : error.message,
        source: 'error'
      },
      { status: 503 } // Service Unavailable
    )
  }
}
