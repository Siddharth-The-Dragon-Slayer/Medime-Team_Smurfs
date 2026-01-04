# FHIR Integration Guide

This document explains how to use the FHIR integration feature in MediMe to import patient data from FHIR servers.

## Overview

The FHIR integration allows users to import their medical data from FHIR-compliant healthcare systems directly into their MediMe profile. This includes patient information, medical conditions, active medications, observations, and healthcare encounters.

## How to Use

1. **Navigate to Profile Page**: Go to `/profile` in the application
2. **Find FHIR Import Section**: Scroll down to see the "Import FHIR Data" card
3. **Enter FHIR ID**: Input your FHIR Patient ID
4. **Import Data**: Click "Import FHIR Data" to fetch and store your medical information

## Dummy FHIR IDs for Testing

For testing purposes, you can use these dummy FHIR Patient IDs:
- `53740183` - Anita Mehta (female, born 1972-03-25, has coronary artery disease, takes Aspirin)
- `53740188` - Rahul Sharma (male, born 1985-08-12, has Type 2 Diabetes, takes Metformin, HbA1c: 8.1%)

## What Data is Imported

### Patient Information
- Full name
- Gender
- Date of birth
- FHIR Patient ID (stored for reference)

### Medical Conditions
- All active conditions from the FHIR record
- Stored in the `medical_conditions` array in the user profile

### Medications
- Active medication requests only
- Medication name and status
- Prescription date
- FHIR MedicationRequest ID (for reference)

### Observations & Lab Results
- Laboratory test results (e.g., HbA1c, glucose levels)
- Vital signs measurements
- Test values with units
- Observation dates and status
- FHIR Observation ID (for reference)

### Healthcare Encounters
- Hospital visits and appointments
- Encounter type (ambulatory, inpatient, etc.)
- Visit dates and duration
- Reason for visit
- FHIR Encounter ID (for reference)

## API Endpoint

**POST** `/api/fhir`

### Request Body
```json
{
  "fhirId": "53740188"
}
```

### Response
```json
{
  "message": "FHIR data imported successfully",
  "data": {
    "patient": {
      "name": "Rahul Sharma",
      "gender": "male",
      "birthDate": "1985-08-12",
      "fhirId": "53740188"
    },
    "conditions": ["Type 2 Diabetes"],
    "medications": [
      {
        "name": "Metformin 500mg",
        "status": "active",
        "authoredOn": null,
        "fhirId": "53740191"
      }
    ],
    "observations": [
      {
        "name": "HbA1c",
        "value": 8.1,
        "unit": "%",
        "date": "2024-12-01",
        "status": "final",
        "fhirId": "53740190"
      }
    ],
    "encounters": [
      {
        "id": "53740192",
        "status": "finished",
        "type": "AMB",
        "start": "2024-06-10",
        "end": "2024-06-10",
        "reason": "Diabetes follow-up"
      }
    ],
    "summary": {
      "totalConditions": 1,
      "totalMedications": 1,
      "totalObservations": 1,
      "totalEncounters": 1,
      "vitalSigns": 0,
      "labResults": 1
    }
  }
}
```

## Database Changes

The integration adds two new fields:

### Profiles Table
- `fhir_id` (TEXT) - Stores the FHIR Patient ID

### Medications Table  
- `fhir_medication_id` (TEXT) - Stores the FHIR MedicationRequest ID

### Vitals Table
- `fhir_observation_id` (TEXT) - Stores the FHIR Observation ID for lab results and vital signs

## FHIR Server Configuration

Currently configured to use the HAPI FHIR test server:
- Base URL: `https://hapi.fhir.org/baseR4/`
- Endpoint: `Patient/{id}/$everything`

## Security Considerations

- User authentication is required to import FHIR data
- Data is only accessible to the authenticated user
- FHIR IDs are stored for reference but not exposed in the UI
- All database operations follow Row Level Security (RLS) policies

## Error Handling

The system handles various error scenarios:
- Invalid FHIR IDs
- Network connectivity issues
- FHIR server unavailability
- Database operation failures
- Authentication errors

## Future Enhancements

Potential improvements for the FHIR integration:
- Support for multiple FHIR servers
- Real-time data synchronization
- More comprehensive data mapping
- FHIR resource validation
- Bulk data import capabilities