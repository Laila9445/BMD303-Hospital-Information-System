# Comprehensive Testing Guide - 8 Logic Gaps + Verifications

## Setup Before Testing
```bash
cd "C:\Users\nada4\BMD303-Hospital-Information-System\backend"
dotnet run --project "CLINICSYSTEM.csproj"
# Server starts at http://localhost:5000
```

**Postman Files to Use:**
- `backend/postman_collection_egypt_fhir_referral_ws.json`
- `backend/postman_environment_egypt_fhir_referral_ws.json`

**Test Users (Password: Doctor@123!):**
- Doctor: doctor@clinic.com
- Physiotherapist: physio@clinic.com
- Radiologist: radiology@clinic.com
- Nurse: nurse@clinic.com
- Patient: patient@clinic.com

---

## Gap 1: POST /api/Referrals - Auto-Derivation Logic ✅

**What to Test:**
- Department & AssignedToRole derived from ReferralType prefix
- PatientExternalId set to PAT-{id}
- PatientName populated from patient record
- FhirServiceRequestId generated
- Notifications created for assigned role

**Test Case 1a: Create Radiology Referral**
```
POST http://localhost:5000/api/Referrals
Authorization: Bearer <doctor_token>
Content-Type: application/json

{
  "patientId": 2,
  "doctorId": 1,
  "referralType": "radiology-chest-xray",
  "urgency": "Urgent",
  "reason": "Chest pain evaluation",
  "notes": "Check for pneumonia"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "referralId": 1,
    "patientId": 2,
    "patientName": "<full name>",
    "patientExternalId": "PAT-2",
    "doctorId": 1,
    "department": "Radiology",
    "assignedToRole": "Radiologist",
    "referralType": "radiology-chest-xray",
    "urgency": "Urgent",
    "status": "Pending",
    "fhirServiceRequestId": "ServiceRequest/...",
    "createdDate": "2026-05-15T..."
  }
}
```

**Verification Checklist:**
- [ ] `department` = "Radiology" ✓
- [ ] `assignedToRole` = "Radiologist" ✓
- [ ] `patientExternalId` = "PAT-2" ✓
- [ ] `fhirServiceRequestId` starts with "ServiceRequest/" ✓
- [ ] Check DB: Notification created for user with Radiologist role ✓

**Test Case 1b: Create Physiotherapy Referral**
```
POST http://localhost:5000/api/Referrals
Authorization: Bearer <doctor_token>

{
  "patientId": 2,
  "doctorId": 1,
  "referralType": "physiotherapy-back-pain",
  "urgency": "Routine",
  "reason": "Chronic back pain",
  "notes": "Post-surgery rehabilitation"
}
```

**Expected:**
- `department` = "Physiotherapy"
- `assignedToRole` = "Physiotherapist"
- Notification sent to Physiotherapist role

---

## Gap 2: GET /api/Referrals/my-referrals - Role Filtering + Urgency Sorting ✅

**What to Test:**
- Each role sees correct subset of referrals
- Physiotherapists/Radiologists sorted by urgency (Emergency → Urgent → Routine)
- Status filter works
- Other roles sorted by creation date

**Test Case 2a: Doctor Role Filtering**
```
GET http://localhost:5000/api/Referrals/my-referrals
Authorization: Bearer <doctor_token>
```

**Expected:**
- Only referrals where `doctorId` = logged-in doctor's ID
- Sorted by creation date (newest first)

**Test Case 2b: Radiologist Urgency Sorting**
```
GET http://localhost:5000/api/Referrals/my-referrals
Authorization: Bearer <radiologist_token>
```

**Expected:**
- All referrals with `assignedToRole` = "Radiologist"
- Sorted by: Emergency (first), Urgent (second), Routine (third)
- Within same urgency: sorted by creation date (newest first)

**Verification Checklist:**
```
Radiologist view should show:
[Emergency referral 1]
[Emergency referral 2]
[Urgent referral 1]
[Urgent referral 2]
[Routine referral 1]
[Routine referral 2]
```

**Test Case 2c: Status Filter**
```
GET http://localhost:5000/api/Referrals/my-referrals?status=Pending
Authorization: Bearer <doctor_token>
```

**Expected:**
- Only Pending referrals returned
- Still sorted correctly for role

---

## Gap 3: PUT /api/Referrals/{id}/status - State Machine Validation ✅ (FIXED)

**What to Test:**
- State machine enforces valid transitions
- Invalid transitions return 400 with error message
- Correct notifications fire for each transition
- FHIR status updates

**State Machine Rules:**
```
Pending → Accepted (Physiotherapist/Radiologist only)
Pending → Cancelled (Doctor who created it, or Nurse)
Accepted → Appointment Booked (Auto from booking, any role)
Accepted → Cancelled (Physiotherapist/Radiologist only)
Appointment Booked → Completed (Physiotherapist/Radiologist only)
Completed → (NO transitions - final state)
Cancelled → (NO transitions - final state)
```

**Test Case 3a: Valid Transition - Pending → Accepted**
```
PUT http://localhost:5000/api/Referrals/1/status
Authorization: Bearer <radiologist_token>
Content-Type: application/json

{
  "status": "Accepted"
}
```

**Expected:**
- 200 OK
- Status changed to "Accepted"
- Notification sent to referring doctor: "Referral Accepted"

**Test Case 3b: Valid Transition - Accepted → Appointment Booked**
```
PUT http://localhost:5000/api/Referrals/1/status
Authorization: Bearer <radiologist_token>

{
  "status": "Appointment Booked"
}
```

**Expected:**
- 200 OK (FIXED - this was throwing 400)
- Status changed to "Appointment Booked"

**Test Case 3c: Invalid Transition - Pending → Completed**
```
PUT http://localhost:5000/api/Referrals/1/status
Authorization: Bearer <radiologist_token>

{
  "status": "Completed",
  "completionNotes": "Patient recovered"
}
```

**Expected:**
- 400 Bad Request
- Error message: "Invalid status transition from Pending to Completed"

**Test Case 3d: Completed → Cancelled (Final State)**
```
PUT http://localhost:5000/api/Referrals/3/status
Authorization: Bearer <nurse_token>

{
  "status": "Cancelled",
  "cancellationReason": "Duplicate referral"
}
```

**Expected:**
- 400 Bad Request
- Error: "Invalid status transition from Completed to Cancelled"

**Verification Checklist:**
- [ ] Pending → Accepted works ✓
- [ ] Accepted → Appointment Booked works ✓ (FIXED)
- [ ] Pending → Completed rejected ✓
- [ ] Completed/Cancelled reject further transitions ✓
- [ ] Notifications fire on each transition ✓

---

## Gap 4: POST /api/Appointments/book - ReferralId + Role Guard ✅

**What to Test:**
- ReferralId is optional (not required)
- When ReferralId provided, role check enforces matching assignedToRole
- Referral auto-advances to "Appointment Booked"
- Invalid role is rejected (400)

**Test Case 4a: Book Appointment WITHOUT Referral**
```
POST http://localhost:5000/api/Appointments/book
Authorization: Bearer <patient_token>
Content-Type: application/json

{
  "timeSlotId": 1,
  "doctorId": 1,
  "reasonForVisit": "General checkup"
}
```

**Expected:**
- 200 OK
- Appointment created
- No referral updated

**Test Case 4b: Book Appointment WITH Valid Referral**
```
POST http://localhost:5000/api/Appointments/book
Authorization: Bearer <radiologist_token>

{
  "timeSlotId": 1,
  "referralId": 1,
  "reasonForVisit": "Radiology consultation"
}
```

**Expected:**
- 200 OK
- Appointment created with `referralId` = 1
- Referral status auto-updated to "Appointment Booked"
- LinkedAppointmentId set on referral

**Test Case 4c: Book Appointment WITH Mismatched Role (ROLE GUARD)**
```
// Create Radiology referral (assignedToRole = "Radiologist")
// Then try to book as Physiotherapist

POST http://localhost:5000/api/Appointments/book
Authorization: Bearer <physiotherapist_token>

{
  "timeSlotId": 2,
  "referralId": 1,
  "reasonForVisit": "Physio consultation"
}
```

**Expected:**
- 400 Bad Request
- Error: "Cannot book appointment... referral is invalid"
- Reason: Physiotherapist role doesn't match Radiologist assignedToRole

**Verification Checklist:**
- [ ] Optional referralId works (can book without it) ✓
- [ ] Referral auto-updates to "Appointment Booked" ✓
- [ ] Role mismatch is rejected ✓
- [ ] Correct role can book ✓
- [ ] LinkedAppointmentId set on referral ✓

---

## Gap 5: POST /api/billing/payments - Response Envelope ✅

**What to Test:**
- Response structure: `{ "data": { "payment": {...}, "invoice": {...} } }`
- Frontend fallback `result?.payment ?? result` works

**Test Case 5a: Record Payment**
```
POST http://localhost:5000/api/billing/payments
Authorization: Bearer <nurse_token>
Content-Type: application/json

{
  "invoiceId": "INV-0001",
  "patientId": 2,
  "patientName": "John Doe",
  "amount": 500,
  "method": "Cash"
}
```

**Expected Response Structure:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "payment": {
      "id": "PAY-001",
      "invoiceId": "INV-0001",
      "patientId": 2,
      "patientName": "John Doe",
      "amount": 500,
      "method": "Cash",
      "date": "2026-05-15",
      "createdAt": "2026-05-15T..."
    },
    "invoice": {
      "id": "INV-0001",
      "patientId": 2,
      "patientName": "John Doe",
      "amount": 1000,
      "totalPaid": 500,
      "remainingAmount": 500,
      "status": "Pending",
      ...
    }
  }
}
```

**Verification Checklist:**
- [ ] Response has `data` wrapper ✓
- [ ] `data.payment` exists with payment details ✓
- [ ] `data.invoice` exists with updated invoice details ✓
- [ ] `remainingAmount` updated correctly ✓
- [ ] Frontend can use `result?.payment ?? result` fallback ✓

---

## Gap 6: GET /api/billing/invoices + payments - Patient Filtering ✅

**What to Test:**
- Patient sees own invoices using 3 ID variants: `userId`, `"PAT-{userId}"`, `"PAT-{1000+userId}"`
- Filtering works across all three variants

**Test Case 6a: Get Patient Invoices**
```
GET http://localhost:5000/api/billing/invoices
Authorization: Bearer <patient_token>
```

**Expected:**
- Invoices filtered by patientId matching any of:
  - `patientId = 2` (exact ID)
  - `patientId = "PAT-2"` (string format)
  - `patientId = "PAT-1002"` (1000 + ID)

**Verification:**
```csharp
var variants = GetPatientIdVariants(userId: 2);
// Returns: ["2", "PAT-2", "PAT-1002"]

var query = query.Where(i => variants.Contains(i.PatientId));
```

- [ ] Patient sees invoices with patientId = "2" ✓
- [ ] Patient sees invoices with patientId = "PAT-2" ✓
- [ ] Patient sees invoices with patientId = "PAT-1002" ✓
- [ ] Other patients' invoices not visible ✓

**Test Case 6b: Get Patient Payments**
```
GET http://localhost:5000/api/billing/payments
Authorization: Bearer <patient_token>
```

**Expected:**
- Same filtering logic applied to payments

---

## Gap 7: BillingService Field Name ✅

**What to Test:**
- JSON serialization uses `status` field (not `activeStatus`)

**Test Case 7a: Get Services**
```
GET http://localhost:5000/api/billing/services
Authorization: Bearer <nurse_token>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "SVC-001",
      "serviceName": "X-Ray",
      "department": "Radiology",
      "price": 500,
      "description": "Chest X-Ray",
      "status": "Active",
      "createdAt": "2026-05-15T...",
      "updatedAt": "2026-05-15T..."
    }
  ]
}
```

**Verification:**
- [ ] Field is `status` (not `activeStatus`) ✓
- [ ] Value is "Active" or "Inactive" ✓
- [ ] Correctly serialized in JSON ✓

---

## Gap 8: FHIR /fhir/ServiceRequest - From Referrals Table ✅

**What to Test:**
- ServiceRequest data comes from Referrals table (not stub data)
- Can query by patient, practitioner, or get all
- FHIR format is correct

**Test Case 8a: Get All ServiceRequests**
```
GET http://localhost:5000/fhir/ServiceRequest
Authorization: Bearer <doctor_token>
Accept: application/fhir+json
```

**Expected:**
- Returns all referrals as FHIR ServiceRequest resources
- Real data from Referrals table (not stubs)

**Test Case 8b: Search by Patient**
```
GET http://localhost:5000/fhir/ServiceRequest?patient=PAT-2
Authorization: Bearer <doctor_token>
Accept: application/fhir+json
```

**Expected:**
- Returns referrals for patient with externalId = "PAT-2"
- Data from Referrals table

**Test Case 8c: Search by Practitioner**
```
GET http://localhost:5000/fhir/ServiceRequest?practitioner=1
Authorization: Bearer <doctor_token>
Accept: application/fhir+json
```

**Expected:**
- Returns referrals created by doctor with ID = 1
- FHIR format

**Verification:**
- [ ] Data comes from Referrals table ✓
- [ ] Patient filter works ✓
- [ ] Practitioner filter works ✓
- [ ] No filter returns all ✓
- [ ] FHIR schema valid ✓

---

## Additional Verifications (Cannot Check via Swagger)

### V1: Global camelCase Serialization
**How to Test:**
- Run any endpoint and check JSON response
- All keys should be camelCase: `referralId`, `patientId`, `createdDate`, etc.
- NOT PascalCase: `ReferralId`, `PatientId`, `CreatedDate`

**Test Any Endpoint:**
```
GET http://localhost:5000/api/Referrals/my-referrals
Authorization: Bearer <doctor_token>
```

**Verify Response:**
```json
{
  "success": true,          // ✓ camelCase
  "message": "Success",     // ✓ camelCase
  "data": [
    {
      "referralId": 1,      // ✓ camelCase
      "patientId": 2,       // ✓ camelCase
      "createdDate": "..."  // ✓ camelCase
    }
  ]
}
```

### V2: Standard Envelope on All Endpoints
**Pattern:** `{ success: boolean, message: string, data: T }`

**Endpoints to Check:**
- [ ] POST /api/Referrals ✓
- [ ] GET /api/Referrals/my-referrals ✓
- [ ] PUT /api/Referrals/{id}/status ✓
- [ ] POST /api/Appointments/book ✓
- [ ] GET /api/billing/invoices ✓
- [ ] POST /api/billing/payments ✓
- [ ] GET /api/billing/services ✓

**Note:** Some older endpoints may NOT have envelope. That's OK if not listed above.

### V3: All 10 Notification Auto-Triggers

**Triggers to Verify:**
```
1. Referral Created → Notify assigned role (Radiologist/Physiotherapist/etc)
2. Referral Accepted → Notify referring doctor
3. Referral Completed → Notify referring doctor
4. Referral Cancelled → Notify referring doctor
5. Referral Appointment Booked → Notify referring doctor

6. Appointment Booked → Notify patient
7. Appointment Rescheduled → Notify patient
8. Appointment Cancelled → Notify patient

9. Consultation Ended → Notify patient
10. Prescription Sent → Notify patient
```

**How to Test:**
- Create referral → Check DB: Notification in `Notifications` table ✓
- Update status → Check DB: New notification created ✓
- Check UserInbox endpoint (if exists) → Notifications appear ✓

### V4: Seed Data Exists
**Required Users (Password: Doctor@123!):**
- doctor@clinic.com (Role: Doctor)
- physio@clinic.com (Role: Physiotherapist)
- radiology@clinic.com (Role: Radiologist)
- nurse@clinic.com (Role: Nurse)
- patient@clinic.com (Role: Patient)

**How to Test:**
```
POST http://localhost:5000/api/Auth/login
Content-Type: application/json

{
  "email": "doctor@clinic.com",
  "password": "Doctor@123!"
}
```

**Expected:**
- 200 OK
- Returns JWT token
- Token valid for 60+ minutes

**Also verify:**
- [ ] Billing services exist (SVC-001 ... SVC-006) ✓
- [ ] Can fetch from GET /api/billing/services ✓

### V5: Appointment Objects Complete
**Appointments should include:**
- [ ] `doctorName` (e.g., "Dr. John Smith") ✓
- [ ] `patientName` (e.g., "Jane Doe") ✓
- [ ] `startTime` (e.g., "09:00:00") ✓
- [ ] `endTime` (e.g., "09:30:00") ✓
- [ ] `referralId` (if booked from referral) ✓

**How to Test:**
```
GET http://localhost:5000/api/Appointments/my-appointments
Authorization: Bearer <patient_token>
```

**Check Response Structure:**
```json
{
  "data": [
    {
      "appointmentId": 1,
      "doctorName": "Dr. John Smith",  // ✓
      "patientName": "Jane Doe",       // ✓
      "startTime": "09:00:00",         // ✓
      "endTime": "09:30:00",           // ✓
      "referralId": 5,                 // ✓ if from referral
      "status": "Scheduled"
    }
  ]
}
```

---

## Quick Test Sequence (30 minutes)

1. **Start Server** (2 min)
   - `dotnet run` in backend folder

2. **Login Tests** (3 min)
   - Doctor login → verify token
   - Patient login → verify token

3. **Create Referral** (2 min)
   - POST Radiology referral as doctor
   - Verify auto-derivation (department, role, PatientExternalId)

4. **My Referrals Filter** (2 min)
   - Login as Radiologist
   - GET /my-referrals → verify sees only Radiology referrals
   - Verify urgency sorting

5. **Status Transitions** (5 min)
   - Pending → Accepted ✓
   - Accepted → Appointment Booked ✓ (CRITICAL FIX)
   - Verify notifications fire

6. **Book Appointment** (5 min)
   - Book appointment with referralId
   - Verify referral auto-updates to "Appointment Booked"
   - Try mismatched role → verify 400 error

7. **Billing** (5 min)
   - Create invoice
   - Create payment → verify `{ data: { payment, invoice } }` structure
   - Patient login → verify can see own invoices (3 ID variants)

8. **FHIR** (3 min)
   - GET /fhir/ServiceRequest → verify real referral data
   - GET /fhir/ServiceRequest?patient=PAT-2 → verify filter

---

## Critical Checklist Before Deployment

- [ ] Build succeeds: `dotnet build CLINICSYSTEM.csproj` ✓
- [ ] No runtime errors on startup
- [ ] Gap 3 (state machine) fixed: Accepted → Appointment Booked now works ✓
- [ ] All 5 test users can login with Doctor@123!
- [ ] Create referral works with auto-derivation
- [ ] My-referrals filtering works by role
- [ ] Status transitions validate correctly
- [ ] Appointment booking with referral works
- [ ] Billing payment returns proper envelope
- [ ] Patient filtering uses 3 ID variants
- [ ] FHIR returns real referral data
- [ ] All notifications create correctly

