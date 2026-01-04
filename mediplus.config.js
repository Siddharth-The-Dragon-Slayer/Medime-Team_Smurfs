/**
 * MediPlus Healthcare System Configuration
 * Enhanced configuration for medical monitoring and FHIR integration
 * Created: 2025 - Latest healthcare technology stack
 */

module.exports = {
  // Healthcare system settings
  healthcare: {
    fhirVersion: '4.0.1',
    vitalsMonitoring: true,
    sosAlerts: true,
    medicationReminders: true,
  },
  
  // Critical health thresholds
  vitals: {
    temperature: {
      normal: { min: 35.5, max: 37.5 },
      warning: { min: 37.5, max: 38.0 },
      critical: { above: 38.0, below: 35.5 }
    },
    heartRate: {
      normal: { min: 60, max: 100 },
      warning: { min: 50, max: 120 },
      critical: { above: 120, below: 50 }
    },
    bloodPressure: {
      normal: { systolic: [90, 120], diastolic: [60, 80] },
      warning: { systolic: [120, 140], diastolic: [80, 90] },
      critical: { systolic: 140, diastolic: 90 }
    }
  },
  
  // Email alert configuration
  alerts: {
    sosEmail: true,
    gmailSmtp: true,
    emergencyContacts: true,
    rateLimiting: {
      maxAlertsPerHour: 3,
      cooldownMinutes: 60
    }
  },
  
  // Database integration
  database: {
    supabase: true,
    realTimeSync: true,
    vitalsLogging: true,
    fhirIntegration: true
  }
}