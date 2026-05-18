# Quick Reference - Critical Test Cases

## The ONE Bug That Was Fixed

**Gap 3: State Machine Bug** ✅ FIXED
```
BEFORE: Accepted → Appointment Booked = 400 ERROR (WRONG)
AFTER:  Accepted → Appointment Booked = 200 OK (FIXED)
```

This was the only logic bug. All 7 other gaps were already correctly implemented.

---

## Must Test These 3 Scenarios (5 min each)

### Scenario 1: Create Referral with Role Derivation
```bash
# As Doctor, create Radiology referral
POST /api/Referrals
Authorization: Bearer <doctor_token>

{
  "patientId": 2,
  "doctorId": 1,
  "referralType": "radiology-chest-xray",
  "urgency": "Urgent",
  "reason": "Chest pain",
  "notes": "Check for pneumonia"
}
```

✅ **VERIFY:**
- department = "Radiology"
- assignedToRole = "Radiologist"
- patientExternalId = "PAT-2"
- fhirServiceRequestId starts with "ServiceRequest/"

---

### Scenario 2: Radiologist Gets Urgent Referrals First (Sorting)
```bash
# As Radiologist
GET /api/Referrals/my-referrals
Authorization: Bearer <radiologist_token>
```

✅ **VERIFY:**
- All items have assignedToRole = "Radiologist"
- Order: Emergency items first, then Urgent, then Routine
- Within same urgency level: sorted by creation date (newest first)

---

### Scenario 3: Book Appointment - Referral Auto-Update + Role Guard
```bash
# Step 1: Create Radiology referral
# Step 2: Update status to "Accepted"
# Step 3: Book appointment WITH referralId

POST /api/Appointments/book
Authorization: Bearer <radiologist_token>

{
  "timeSlotId": 1,
  "referralId": 1,
  "reasonForVisit": "Radiology consultation"
}
```

✅ **VERIFY:**
- Appointment created
- Referral.Status auto-changed to "Appointment Booked" ← CRITICAL FIX
- Referral.LinkedAppointmentId = appointment ID

---

## Test Users Login (Password: Doctor@123!)
```
POST /api/Auth/login

doctor@clinic.com
physio@clinic.com
radiology@clinic.com
nurse@clinic.com
patient@clinic.com
```

---

## 5-Minute Smoke Test

```bash
# 1. Start server
cd backend && dotnet run

# 2. Login as doctor (get token)
POST /api/Auth/login
  email: doctor@clinic.com
  password: Doctor@123!

# 3. Create referral
POST /api/Referrals
  referralType: "radiology-ct-scan"
  urgency: "Emergency"
  # ... other fields

# 4. Check status shows "Radiology" department ✓

# 5. Login as radiologist (get token)
POST /api/Auth/login
  email: radiology@clinic.com
  password: Doctor@123!

# 6. Get my referrals
GET /api/Referrals/my-referrals
# Should see the referral created in step 3 ✓
# Emergency should appear first ✓

# 7. Update referral status to Accepted
PUT /api/Referrals/{id}/status
  status: "Accepted"

# 8. Book appointment with this referral
POST /api/Appointments/book
  referralId: {id}
  timeSlotId: 1

# 9. Check referral updated to "Appointment Booked" ✓ (CRITICAL FIX)

# All 3 scenarios work = DEPLOY READY!
```

---

## Billing Response Structure (Critical)

```json
POST /api/billing/payments
{
  "success": true,
  "message": "Success",
  "data": {
    "payment": { ... },
    "invoice": { ... }
  }
}
```

✅ **VERIFY:** Frontend gets `result?.payment` OR `result` as fallback

---

## FHIR Real Data Check

```bash
# Should return REAL referral data from Referrals table
GET /fhir/ServiceRequest?patient=PAT-2
Accept: application/fhir+json
Authorization: Bearer <token>
```

✅ **VERIFY:** Data matches referrals created via API (not stub data)

---

## Deployment Checklist

- [x] Build succeeds (no errors)
- [x] State machine bug fixed (Accepted → Appointment Booked now works)
- [x] All 7 other gaps verified as working correctly
- [ ] Run 5-minute smoke test above
- [ ] Verify billing envelope structure
- [ ] Verify patient filtering works (3 ID variants)
- [ ] Verify FHIR returns real data
- [ ] Ready to deploy! 🚀

