# 🔗 FHIR API Integration Guide for Physiotherapy Clinic

## 📋 Overview

This Clinic Management System now provides **HL7 FHIR R4 compliant endpoints** to enable seamless integration with external healthcare systems, specifically designed for **Physiotherapy Clinic integration**.

**FHIR Version:** R4 (4.0.1)  
**Base URL:** `https://your-api-domain.com/fhir`  
**Content-Type:** `application/fhir+json`  
**Authentication:** JWT Bearer Token

---

## 🎯 What is FHIR?

**Fast Healthcare Interoperability Resources (FHIR)** is a healthcare data exchange standard developed by HL7. It enables different healthcare systems to share patient information securely and efficiently using RESTful APIs and standard resources.

### Why FHIR for Physiotherapy Integration?

✅ **Standardized Data Exchange** - Industry-standard format for healthcare data  
✅ **Interoperability** - Works with any FHIR-compliant system  
✅ **Patient Safety** - Complete medical history access  
✅ **Efficiency** - Automated referrals and care plan sharing  
✅ **Compliance** - Meets healthcare data regulations  

---

## 🔐 Authentication

All FHIR endpoints require JWT authentication:

```http
GET /fhir/Patient/PAT-001
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Accept: application/fhir+json
```

### Getting a Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "doctor@clinic.com",
  "password": "your-password"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 7200
}
```

---

## 📚 Available FHIR Resources

| Resource | FHIR Type | Description | Use Case |
|----------|-----------|-------------|----------|
| **Patient** | Patient | Patient demographics | Patient identification |
| **Practitioner** | Practitioner | Doctor/therapist info | Provider details |
| **Condition** | Condition | Diagnoses | Medical conditions |
| **CarePlan** | CarePlan | Therapy plans | Treatment plans |
| **ServiceRequest** | ServiceRequest | Referrals | Referral management |
| **Appointment** | Appointment | Scheduled visits | Appointment tracking |
| **Observation** | Observation | Clinical measurements | Assessment data |

---

## 🚀 API Endpoints

### 1. **FHIR Metadata (Capability Statement)**

Get supported FHIR resources and operations:

```http
GET /fhir/metadata
```

**Response:** Lists all supported resources, search parameters, and interactions.

---

### 2. **Patient Resources**

#### Get Patient by ID
```http
GET /fhir/Patient/{patientExternalId}
```

**Example:**
```http
GET /fhir/Patient/PAT-001
```

**Response:**
```json
{
  "resourceType": "Patient",
  "id": "PAT-001",
  "identifier": [
    {
      "system": "https://clinic-system.com/patient-id",
      "value": "PAT-001",
      "use": "official"
    }
  ],
  "active": true,
  "name": [
    {
      "use": "usual",
      "text": "John Doe",
      "given": ["John"],
      "family": "Doe"
    }
  ],
  "telecom": [
    {
      "system": "phone",
      "value": "+201234567890",
      "use": "mobile"
    }
  ]
}
```

#### Search Patients
```http
GET /fhir/Patient?identifier={externalId}&name={name}
```

**Examples:**
```http
GET /fhir/Patient?identifier=PAT-001
GET /fhir/Patient?name=John
```

---

### 3. **Practitioner Resources (Doctors)**

#### Get Practitioner by ID
```http
GET /fhir/Practitioner/{doctorId}
```

**Example:**
```http
GET /fhir/Practitioner/1
```

**Response:**
```json
{
  "resourceType": "Practitioner",
  "id": "1",
  "identifier": [
    {
      "system": "https://clinic-system.com/practitioner-id",
      "value": "1",
      "use": "official"
    },
    {
      "system": "https://clinic-system.com/license-number",
      "value": "LIC-12345",
      "use": "official"
    }
  ],
  "active": true,
  "name": [
    {
      "use": "usual",
      "given": ["Ahmed"],
      "family": "Mohamed"
    }
  ],
  "qualification": [
    {
      "code": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/v2-0360",
            "code": "Orthopedic",
            "display": "Orthopedic"
          }
        ],
        "text": "Orthopedic"
      }
    }
  ]
}
```

#### Search Practitioners
```http
GET /fhir/Practitioner?name={name}&specialization={specialization}
```

**Examples:**
```http
GET /fhir/Practitioner?name=Ahmed
GET /fhir/Practitioner?specialization=Orthopedic
```

---

### 4. **Condition Resources (Diagnoses)**

#### Get Condition by ID
```http
GET /fhir/Condition/condition-{consultationId}
```

**Example:**
```http
GET /fhir/Condition/condition-123
```

**Response:**
```json
{
  "resourceType": "Condition",
  "id": "condition-123",
  "clinicalStatus": "active",
  "verificationStatus": "confirmed",
  "category": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/condition-category",
        "code": "encounter-diagnosis",
        "display": "Encounter Diagnosis"
      }
    ]
  },
  "code": {
    "coding": [
      {
        "display": "Lower back pain with sciatica"
      }
    ],
    "text": "Lower back pain with sciatica"
  },
  "subject": {
    "reference": "Patient/PAT-001"
  },
  "recordedDate": "2024-01-15"
}
```

#### Search Conditions by Patient
```http
GET /fhir/Condition?patient={patientExternalId}
```

**Example:**
```http
GET /fhir/Condition?patient=PAT-001
```

**Returns:** All diagnoses for the patient in a FHIR Bundle.

---

### 5. **CarePlan Resources (Therapy Plans)** ⭐

This is **critical for physiotherapy integration** - it contains therapy plans and sessions.

#### Get CarePlan by ID
```http
GET /fhir/CarePlan/{therapyPlanId}
```

**Example:**
```http
GET /fhir/CarePlan/456
```

**Response:**
```json
{
  "resourceType": "CarePlan",
  "id": "456",
  "status": "active",
  "intent": "plan",
  "category": {
    "coding": [
      {
        "system": "http://hl7.org/fhir/us/core/CodeSystem/careplan-category",
        "code": "assess-plan",
        "display": "Physical Therapy"
      }
    ],
    "text": "Physical Therapy"
  },
  "title": "Post-Surgery Rehabilitation Plan",
  "description": "Restore range of motion and strengthen lower back muscles",
  "subject": {
    "reference": "Patient/PAT-001"
  },
  "period": {
    "start": "2024-01-20",
    "end": "2024-04-20"
  },
  "created": "2024-01-15T10:30:00Z",
  "activity": [
    {
      "detail": {
        "status": "scheduled",
        "scheduled": {
          "start": "2024-01-22T09:00:00Z"
        },
        "description": "Initial assessment and treatment session"
      }
    },
    {
      "detail": {
        "status": "scheduled",
        "scheduled": {
          "start": "2024-01-25T09:00:00Z"
        },
        "description": "Follow-up session - strengthening exercises"
      }
    }
  ],
  "note": "Patient should avoid heavy lifting for 4 weeks"
}
```

#### Search CarePlans by Patient
```http
GET /fhir/CarePlan?patient={patientExternalId}&status={status}
```

**Examples:**
```http
GET /fhir/CarePlan?patient=PAT-001
GET /fhir/CarePlan?patient=PAT-001&status=active
```

**Status Values:** `draft`, `active`, `on-hold`, `revoked`, `completed`

---

### 6. **ServiceRequest Resources (Referrals)** 🔥

This is the **primary resource for referral integration** between the clinic and physiotherapy system.

#### Get ServiceRequest (Referral) by ID
```http
GET /fhir/ServiceRequest/{referralId}
```

**Example:**
```http
GET /fhir/ServiceRequest/789
```

**Response:**
```json
{
  "resourceType": "ServiceRequest",
  "id": "789",
  "identifier": [
    {
      "system": "https://clinic-system.com/referral-id",
      "value": "789"
    },
    {
      "system": "https://clinic-system.com/external-referral-id",
      "value": "EXT-REF-456"
    }
  ],
  "status": "active",
  "intent": "order",
  "priority": {
    "coding": [
      {
        "system": "http://hl7.org/fhir/request-priority",
        "code": "urgent",
        "display": "Urgent"
      }
    ]
  },
  "code": {
    "coding": [
      {
        "system": "http://snomed.info/sct",
        "display": "Physiotherapy"
      }
    ],
    "text": "Physiotherapy"
  },
  "subject": {
    "reference": "Patient/PAT-001"
  },
  "authoredOn": "2024-01-15T10:30:00Z",
  "requester": {
    "reference": "Practitioner/1",
    "display": "Dr. Ahmed Mohamed"
  },
  "reason": "Post-surgery rehabilitation required",
  "note": "Patient had lumbar surgery on 2024-01-10. Requires intensive rehabilitation program."
}
```

#### Search ServiceRequests (Referrals)
```http
GET /fhir/ServiceRequest?patient={patientExternalId}&status={status}
GET /fhir/ServiceRequest?practitioner={doctorId}&status={status}
```

**Examples:**
```http
GET /fhir/ServiceRequest?patient=PAT-001
GET /fhir/ServiceRequest?patient=PAT-001&status=active
GET /fhir/ServiceRequest?practitioner=1
```

**Status Values:**
- `draft` - Pending (not yet sent)
- `active` - Sent/Accepted/In Progress
- `completed` - Completed
- `revoked` - Cancelled

**Priority Values:**
- `routine` - Normal priority
- `urgent` - Urgent
- `asap` - ASAP
- `stat` - Emergency

---

### 7. **Appointment Resources**

#### Get Appointment by ID
```http
GET /fhir/Appointment/{appointmentId}
```

**Example:**
```http
GET /fhir/Appointment/101
```

**Response:**
```json
{
  "resourceType": "Appointment",
  "id": "101",
  "status": "booked",
  "serviceCategory": {
    "coding": [
      {
        "display": "Orthopedic"
      }
    ]
  },
  "start": "2024-01-20T09:00:00",
  "end": "2024-01-20T09:30:00",
  "minutesDuration": 30,
  "created": "2024-01-15T10:30:00Z",
  "participant": [
    {
      "type": "patient",
      "actor": {
        "reference": "Patient/PAT-001"
      },
      "status": "accepted"
    },
    {
      "type": "practitioner",
      "actor": {
        "reference": "Practitioner/1",
        "display": "Dr. Ahmed Mohamed"
      },
      "status": "accepted"
    }
  ]
}
```

#### Search Appointments
```http
GET /fhir/Appointment?patient={patientExternalId}&date={date}
GET /fhir/Appointment?practitioner={doctorId}&date={date}
```

**Examples:**
```http
GET /fhir/Appointment?patient=PAT-001&date=2024-01-20
GET /fhir/Appointment?practitioner=1&date=2024-01-20
```

---

### 8. **Observation Resources (Clinical Measurements)**

Useful for physiotherapy assessments: range of motion, pain scale, strength measurements, etc.

#### Search Observations by Patient
```http
GET /fhir/Observation?patient={patientExternalId}&category={category}
```

**Example:**
```http
GET /fhir/Observation?patient=PAT-001
```

**Response:**
```json
{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 2,
  "entry": [
    {
      "resource": {
        "resourceType": "Observation",
        "id": "obs-diagnosis-123",
        "status": "final",
        "category": {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/observation-category",
              "code": "survey",
              "display": "Survey"
            }
          ],
          "text": "Clinical Assessment"
        },
        "code": {
          "coding": [
            {
              "system": "http://loinc.org",
              "code": "11476-4",
              "display": "Diagnosis"
            }
          ],
          "text": "Lower back pain with sciatica"
        },
        "subject": {
          "reference": "Patient/PAT-001"
        },
        "effectiveDateTime": "2024-01-15",
        "note": "Patient reports pain level 7/10, radiating down left leg"
      }
    }
  ]
}
```

---

## 🔗 Integration Workflow: Clinic → Physiotherapy

### **Scenario 1: Referring a Patient to Physiotherapy**

#### Step 1: Doctor Creates Referral in Clinic System
```http
POST /api/referrals
Authorization: Bearer {token}
Content-Type: application/json

{
  "patientExternalId": "PAT-001",
  "doctorId": 1,
  "referralType": "Physiotherapy",
  "reason": "Post-surgery rehabilitation",
  "diagnosis": "Lower back pain with sciatica",
  "recommendedTreatment": "Physical therapy program - 12 sessions over 8 weeks",
  "priority": "Urgent",
  "doctorNotes": "Patient had lumbar surgery on 2024-01-10",
  "autoSend": true
}
```

#### Step 2: Physiotherapy Clinic Retrieves Referral via FHIR
```http
GET /fhir/ServiceRequest/789
Authorization: Bearer {physio-token}
Accept: application/fhir+json
```

#### Step 3: Physiotherapy Clinic Gets Patient Information
```http
GET /fhir/Patient/PAT-001
```

#### Step 4: Physiotherapy Clinic Gets Diagnosis/Medical History
```http
GET /fhir/Condition?patient=PAT-001
```

#### Step 5: Physiotherapy Clinic Creates CarePlan
(Physiotherapy system creates this in their system)

#### Step 6: Clinic Retrieves CarePlan via FHIR
```http
GET /fhir/CarePlan?patient=PAT-001&status=active
```

---

### **Scenario 2: Tracking Referral Status**

#### Physiotherapy Updates Referral Status
Physiotherapy system updates referral status via their API.

#### Clinic Monitors Status via FHIR
```http
GET /fhir/ServiceRequest?patient=PAT-001
```

**Status Progression:**
1. `draft` - Referral created
2. `active` - Sent to physiotherapy
3. `active` - Accepted by physiotherapy
4. `completed` - Treatment completed

---

### **Scenario 3: Viewing Therapy Progress**

#### Get All CarePlans for Patient
```http
GET /fhir/CarePlan?patient=PAT-001
```

#### Get Specific CarePlan with Sessions
```http
GET /fhir/CarePlan/456
```

**Includes:**
- Therapy plan details
- Scheduled sessions
- Session status (scheduled, completed, cancelled)
- Progress notes

---

## 📊 FHIR Bundle Responses

Most search endpoints return **FHIR Bundles** containing multiple resources:

```json
{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 5,
  "entry": [
    {
      "resource": { /* FHIR Resource */ },
      "fullUrl": "/fhir/ResourceType/id"
    }
  ]
}
```

---

## ❌ Error Handling (FHIR OperationOutcome)

All errors return FHIR-compliant OperationOutcome:

```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "not-found",
      "details_text": "Patient PAT-999 not found"
    }
  ]
}
```

**Severity Levels:**
- `fatal` - System error
- `error` - Request error
- `warning` - Non-critical issue
- `information` - Informational message

**Common Error Codes:**
- `not-found` - Resource doesn't exist
- `required` - Missing required parameter
- `invalid` - Invalid parameter value
- `forbidden` - Insufficient permissions
- `processing` - Server error

---

## 🔧 Implementation Guide for Physiotherapy System

### **Step 1: Configure Authentication**

Obtain JWT token from clinic system:
```javascript
const token = await authenticate({
  email: 'physio@clinic.com',
  password: 'your-password'
});
```

### **Step 2: Listen for New Referrals**

Poll for new referrals:
```javascript
// Check for new referrals every 5 minutes
setInterval(async () => {
  const referrals = await fetch('/fhir/ServiceRequest?status=active', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const bundle = await referrals.json();
  
  bundle.entry.forEach(async (entry) => {
    const referral = entry.resource;
    await processNewReferral(referral);
  });
}, 300000);
```

### **Step 3: Retrieve Patient Details**

```javascript
async function getPatientDetails(patientId) {
  const response = await fetch(`/fhir/Patient/${patientId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return await response.json();
}
```

### **Step 4: Get Medical History**

```javascript
async function getMedicalHistory(patientId) {
  const [conditions, carePlans, observations] = await Promise.all([
    fetch(`/fhir/Condition?patient=${patientId}`, { headers: auth }),
    fetch(`/fhir/CarePlan?patient=${patientId}`, { headers: auth }),
    fetch(`/fhir/Observation?patient=${patientId}`, { headers: auth })
  ]);
  
  return {
    conditions: await conditions.json(),
    carePlans: await carePlans.json(),
    observations: await observations.json()
  };
}
```

### **Step 5: Update Referral Status**

Physiotherapy system should update referral status in their system, which clinic can retrieve via FHIR.

### **Step 6: Share Therapy Progress**

Create observations for therapy measurements:
```javascript
const observation = {
  resourceType: "Observation",
  status: "final",
  category: {
    coding: [{
      system: "http://terminology.hl7.org/CodeSystem/observation-category",
      code: "therapy",
      display: "Therapy Assessment"
    }]
  },
  code: {
    coding: [{
      system: "http://loinc.org",
      code: "72133-2",
      display: "Range of motion"
    }],
    text: "Lumbar spine flexion"
  },
  valueQuantity: {
    value: 45,
    unit: "degrees",
    system: "http://unitsofmeasure.org",
    code: "deg"
  },
  subject: {
    reference: "Patient/PAT-001"
  },
  effectiveDateTime: "2024-01-22",
  note: "Improved from 30 degrees last session"
};
```

---

## 🧪 Testing Examples

### Using cURL

```bash
# Get patient details
curl -X GET "https://api.clinic.com/fhir/Patient/PAT-001" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/fhir+json"

# Search referrals for patient
curl -X GET "https://api.clinic.com/fhir/ServiceRequest?patient=PAT-001" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/fhir+json"

# Get therapy plan
curl -X GET "https://api.clinic.com/fhir/CarePlan/456" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/fhir+json"
```

### Using Postman

1. Set Base URL: `https://api.clinic.com/fhir`
2. Set Headers:
   - `Authorization: Bearer {{token}}`
   - `Accept: application/fhir+json`
3. Test endpoints:
   - `GET /fhir/metadata`
   - `GET /fhir/Patient/PAT-001`
   - `GET /fhir/ServiceRequest?patient=PAT-001`

---

## 🔒 Security & Privacy

### Data Protection
✅ JWT authentication required for all endpoints  
✅ Role-based access control (Doctor, Admin, Staff)  
✅ Patient data only accessible to authorized users  
✅ Audit logging enabled  
✅ HTTPS/TLS encryption  

### Best Practices
- Use short-lived JWT tokens (2 hours)
- Implement token refresh mechanism
- Validate patient consent before sharing data
- Log all data access for compliance
- Rate limit API requests

---

## 📈 Monitoring & Logging

All FHIR API calls are logged with:
- Timestamp
- User ID
- Resource type accessed
- Patient ID (if applicable)
- Response status

**Example Log Entry:**
```
[INFO] FHIR: Retrieving Patient: PAT-001 by User: doctor@clinic.com
[INFO] FHIR: Searching ServiceRequests for patient: PAT-001
```

---

## 🆘 Troubleshooting

### Issue: 401 Unauthorized
**Solution:** Check JWT token is valid and not expired.

### Issue: 404 Not Found
**Solution:** Verify resource ID exists. Check Patient ID format (should be external ID).

### Issue: Empty Results
**Solution:** Check search parameters. Some resources require specific parameters (e.g., `patient` for Condition search).

### Issue: Invalid FHIR Format
**Solution:** Ensure `Accept: application/fhir+json` header is set.

---

## 📞 Support

For integration support:
- **Documentation:** Check `/fhir/metadata` for supported resources
- **Swagger UI:** `https://api.clinic.com/swagger`
- **API Base:** `https://api.clinic.com/fhir`

---

## 🎓 FHIR Resources Reference

- **Official FHIR R4 Specification:** http://hl7.org/fhir/R4/
- **Patient Resource:** http://hl7.org/fhir/R4/patient.html
- **Practitioner Resource:** http://hl7.org/fhir/R4/practitioner.html
- **Condition Resource:** http://hl7.org/fhir/R4/condition.html
- **CarePlan Resource:** http://hl7.org/fhir/R4/careplan.html
- **ServiceRequest Resource:** http://hl7.org/fhir/R4/servicerequest.html
- **Appointment Resource:** http://hl7.org/fhir/R4/appointment.html
- **Observation Resource:** http://hl7.org/fhir/R4/observation.html

---

## ✅ Quick Start Checklist

- [ ] Obtain JWT token from clinic system
- [ ] Test `/fhir/metadata` endpoint
- [ ] Retrieve test patient data
- [ ] Access referral (ServiceRequest) data
- [ ] Retrieve therapy plans (CarePlan)
- [ ] Implement referral polling mechanism
- [ ] Set up error handling
- [ ] Test with real patient data
- [ ] Implement status update workflow
- [ ] Set up monitoring and logging

---

**Version:** 1.0.0  
**Last Updated:** 2024-01-15  
**FHIR Version:** R4 (4.0.1)
