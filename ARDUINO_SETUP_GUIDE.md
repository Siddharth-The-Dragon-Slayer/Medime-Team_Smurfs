# Arduino IoT Sensor Integration Guide

This guide will help you integrate your Arduino ESP8266 (NodeMCU) sensor data with the vital signs dashboard.

## Prerequisites

- NodeMCU ESP8266 board with Arduino code uploaded
- DHT11 temperature sensor connected to pin D2
- Heartbeat/pulse sensor connected to pin A0
- Arduino connected to the same WiFi network as your computer

## Setup Instructions

### 1. Upload Arduino Code

Upload the provided Arduino code to your NodeMCU ESP8266. The code should:
- Connect to WiFi (SSID: "Harsh")
- Read temperature from DHT11 sensor
- Read heartbeat from pulse sensor
- Serve data via HTTP on `/data` endpoint

### 2. Get Arduino IP Address

1. Open Arduino IDE Serial Monitor (9600 baud)
2. Reset your NodeMCU
3. Wait for WiFi connection
4. Note the IP address displayed (e.g., `192.168.1.100`)

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and update the Arduino IP address:
   ```env
   ARDUINO_IP_ADDRESS=192.168.1.100  # Replace with your actual IP
   ```

### 4. Restart Development Server

If your dev server is running, restart it to pick up the new environment variable:
```bash
npm run dev
```

## Using the Dashboard

### Accessing the Vital Signs Monitor

Navigate to either:
- `/dashboard` - Main dashboard with vital signs
- `/vitals` - Dedicated vital signs page

### Dashboard Controls

**Start Monitoring Button**
- Click to begin fetching data from Arduino
- Data updates every 10 seconds (matching Arduino's sensor read interval)
- Green pulsing indicator shows active monitoring

**Use Simulation / Use Real Data Toggle**
- Switch between real Arduino data and simulated data
- Useful for testing when Arduino is disconnected

### Connection Status Indicators

**Arduino Connected** (Green badge with WiFi icon)
- Successfully receiving data from Arduino
- Temperature and heartbeat values are real sensor readings

**Arduino Disconnected** (Gray badge with WiFi-off icon)
- Cannot connect to Arduino
- Automatically switches to simulation mode
- Check Arduino power, WiFi connection, and IP address

**Simulation Mode** (Gray badge)
- Using simulated data instead of real sensors
- Click "Use Real Data" to attempt Arduino connection again

## Data Mapping

The Arduino provides the following data:
- `temperature` (°C) → Dashboard temperature
- `heartbeat` (0-1023 analog value) → Converted to heart rate BPM (60-100)

Default values (Arduino doesn't provide these):
- Oxygen level: 98%
- Humidity: 45%

## Alert System

The dashboard monitors vital signs and shows alerts for:

**Temperature**
- Normal: 35.5-37.5°C
- Warning: 37.5-38.0°C
- Critical: <35.5°C or >38.0°C

**Heart Rate**
- Normal: 60-100 BPM
- Warning: 50-60 or 100-120 BPM
- Critical: <50 or >120 BPM

## Troubleshooting

### Arduino Not Connecting

1. **Check IP Address**
   - Verify the IP in `.env` matches Arduino Serial Monitor output
   - Ensure no typos in the IP address

2. **Check Network**
   - Arduino and computer must be on same WiFi network
   - Try pinging the Arduino: `ping 192.168.1.100`

3. **Check Arduino**
   - Verify Arduino is powered on
   - Check Serial Monitor for WiFi connection status
   - Look for "WiFi CONNECTED!" message

4. **Test Arduino Endpoint**
   - Open browser and navigate to `http://192.168.1.100/data`
   - Should see JSON response with temperature and heartbeat

### Data Not Updating

1. **Check Monitoring Status**
   - Ensure "Start Monitoring" button is active
   - Look for green pulsing indicator

2. **Check Browser Console**
   - Open DevTools (F12)
   - Look for errors in Console tab
   - Check Network tab for `/api/arduino` requests

3. **Verify Sensors**
   - Check DHT11 sensor connections (VCC, GND, Data to D2)
   - Check pulse sensor connections (VCC, GND, Signal to A0)
   - Verify sensor readings in Arduino Serial Monitor

### Incorrect Readings

**Temperature Shows 0°C**
- DHT11 sensor not connected properly
- Check wiring and sensor orientation
- Verify DHT11 library is installed

**Heart Rate Always Same Value**
- Pulse sensor not detecting heartbeat
- Ensure finger is properly placed on sensor
- Check sensor sensitivity/threshold in Arduino code

## API Reference

### GET /api/arduino

Fetches current sensor data from Arduino.

**Response (Success)**
```json
{
  "temperature": 36.5,
  "heartRate": 72,
  "oxygenLevel": 98,
  "humidity": 45,
  "timestamp": "2026-01-03T14:42:00.000Z",
  "arduinoTimestamp": 12345,
  "connected": true,
  "source": "arduino"
}
```

**Response (Error)**
```json
{
  "temperature": 0,
  "heartRate": 0,
  "oxygenLevel": 0,
  "humidity": 0,
  "timestamp": "2026-01-03T14:42:00.000Z",
  "connected": false,
  "error": "Connection timeout",
  "source": "error"
}
```

## Advanced Configuration

### Changing Update Interval

The dashboard fetches data every 10 seconds by default. To change this:

Edit `components/vital-signs-dashboard.tsx`:
```typescript
interval = setInterval(() => {
  fetchVitalSigns()
}, 10000) // Change 10000 to desired milliseconds
```

### Adjusting Heartbeat Conversion

The heartbeat analog value (0-1023) is converted to BPM (60-100). To adjust:

Edit `app/api/arduino/route.ts`:
```typescript
const heartRateBPM = Math.floor(60 + (data.heartbeat / 1023) * 40)
// Adjust the 60 (min BPM) and 40 (range) as needed
```

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all connections and configurations
3. Review browser console and server logs for errors
