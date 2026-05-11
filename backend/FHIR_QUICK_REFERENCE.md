# 🚀 FHIR API Quick Reference Card

## Base URL
```
https://your-domain.com/fhir
```

## Authentication
```http
Authorization: Bearer {JWT_TOKEN}
Accept: application/fhir+json
```

---

## 📋 Essential Endpoints for Physiotherapy Integration

### **1. Get Referrals (ServiceRequests)**
```http
GET /fhir/ServiceRequest?patient={patientExternalId}
GET /fhir/ServiceRequest?patient={patientExternalId}&status=active
GET /fhir/ServiceRequest/{referralId}
```

### **2. Get Patient Information**
```http
GET /fhir/Patient/{patientExternalId}
GET /fhir/Patient?identifier={patientExternalId}
GET /fhir/Patient?name={patientName}
```

### **3. Get Medical History (Conditions)**
```http
GET /fhir/Condition?patient={patientExternalId}
GET /fhir/Condition/condition-{consultationId}
```

### **4. Get Therapy Plans (CarePlans)**
```http
GET /fhir/CarePlan?patient={patientExternalId}&status=active
GET /fhir/CarePlan/{therapyPlanId}
```

### **5. Get Appointments**
```http
GET /fhir/Appointment?patient={patientExternalId}&date=2024-01-20
GET /fhir/Appointment/{appointmentId}
```

### **6. Get Clinical Observations**
```http
GET /fhir/Observation?patient={patientExternalId}
GET /fhir/Observation/encounter/{consultationId}
```

### **7. Get Doctor Information**
```http
GET /fhir/Practitioner/{doctorId}
GET /fhir/Practitioner?name={doctorName}
GET /fhir/Practitioner?specialization=Orthopedic
```

---

## 🔄 Common Workflows

### **New Referral Received**
```javascript
// 1. Check for new referrals
const referrals = await fetch('/fhir/ServiceRequest?status=active', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// 2. Get patient details
const patient = await fetch(`/fhir/Patient/${patientId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// 3. Get medical history
const conditions = await fetch(`/fhir/Condition?patient=${patientId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### **Update Therapy Progress**
```javascript
// Physiotherapy system creates observations
const observation = {
  resourceType: "Observation",
  status: "final",
  code: { text: "Range of motion assessment" },
  valueQuantity: { value: 45, unit: "degrees" },
  subject: { reference: "Patient/PAT-001" }
};
```

---

## 📊 Response Format

### **Single Resource**
```json
{
  "resourceType": "Patient",
  "id": "PAT-001",
  "active": true,
  "name": [{ "text": "John Doe" }]
}
```

### **Search Results (Bundle)**
```json
{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 5,
  "entry": [
    {
      "resource": { /* FHIR Resource */ },
      "fullUrl": "/fhir/Patient/PAT-001"
    }
  ]
}
```

### **Error Response**
```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "not-found",
    "details_text": "Patient not found"
  }]
}
```

---

## 🔑 Status Mappings

### **Referral Status**
| Clinic System | FHIR Status |
|--------------|-------------|
| Pending | draft |
| Sent | active |
| Accepted | active |
| InProgress | active |
| Completed | completed |
| Cancelled | revoked |

### **Therapy Plan Status**
| Clinic System | FHIR Status |
|--------------|-------------|
| Active | active |
| Completed | completed |
| Suspended | on-hold |
| Cancelled | revoked |

### **Appointment Status**
| Clinic System | FHIR Status |
|--------------|-------------|
| Scheduled | booked |
| Confirmed | booked |
| CheckedIn | arrived |
| Completed | fulfilled |
| Cancelled | cancelled |
| NoShow | noshow |

---

## 🧪 Quick Test Commands

```bash
# Get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@clinic.com","password":"password"}'

# Test metadata
curl http://localhost:5000/fhir/metadata

# Get patient
curl http://localhost:5000/fhir/Patient/PAT-001 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search referrals
curl "http://localhost:5000/fhir/ServiceRequest?patient=PAT-001" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📚 Documentation

- **Full Guide:** `FHIR_INTEGRATION_GUIDE.md`
- **Implementation Summary:** `FHIR_IMPLEMENTATION_SUMMARY.md`
- **FHIR R4 Spec:** http://hl7.org/fhir/R4/
- **Swagger UI:** http://localhost:5000/swagger

---

## ⚠️ Important Notes

1. **All endpoints require JWT authentication**
2. **Patient IDs are external IDs** (e.g., "PAT-001")
3. **Condition IDs format:** `condition-{consultationId}`
4. **Search endpoints return FHIR Bundles**
5. **Content-Type:** `application/fhir+json`
6. **Date format:** ISO 8601 (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)

---

**Version:** 1.0.0 | **FHIR:** R4 (4.0.1) | **Status:** ✅ Production Ready
