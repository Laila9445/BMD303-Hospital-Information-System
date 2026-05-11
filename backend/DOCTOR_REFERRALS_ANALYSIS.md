# Doctor Medical Referrals - Frontend vs Backend Analysis

## 🚨 CRITICAL ISSUES FOUND

### Issue 1: Endpoint Mismatch
**Frontend Shows**: "Referral List (1)" with Doctor's own referrals
**Backend Has**: `GET /api/referrals/doctor/{doctorId}` - requires explicit doctorId

**Problem**: No endpoint for current logged-in doctor to get THEIR referrals

### Issue 2: Data Structure Mismatch
**Frontend Shows**: 
- Patient ID: "N/A" (string)
- Referral Type: "Radiology" 
- Reason: "Persistent knee pain"
- Urgency: "Routine" (blue pill)
- Status: Green pill (not visible text)
- Created Date & Time: "May 10, 2026, 11:45 PM"

**Backend Has**:
- PatientExternalId (string) ✅
- ReferralType (string) ✅  
- Reason (string) ✅
- Priority ("Low|Normal|High|Urgent") ❌ Mismatch
- Status ("Pending|Sent|Accepted|InProgress|Completed|Cancelled") ✅
- CreatedAt (DateTime) ✅

**Problem**: Frontend shows "Routine" urgency, backend expects "Normal"

### Issue 3: Missing Endpoint for Current Doctor
**Frontend Needs**: Get referrals for logged-in doctor
**Backend Has**: Only `GET /api/referrals/doctor/{doctorId}` (requires explicit ID)

## 🔧 REQUIRED BACKEND FIXES

### 1. Add Current Doctor Referrals Endpoint
```csharp
[Authorize(Roles = "Doctor")]
[HttpGet("my-referrals")]
public async Task<IActionResult> GetMyReferrals([FromQuery] string? status = null)
{
    var userId = GetUserId();
    if (userId == 0) return Unauthorized();

    var referrals = await _referralService.GetDoctorReferralsAsync(userId, status);
    return Ok(referrals);
}
```

### 2. Fix Urgency/Priority Mismatch
**Frontend shows**: "Routine" 
**Backend expects**: "Normal"

**Solution**: Update frontend to use "Normal" or update backend to accept "Routine"

### 3. Add Patient ID Display
**Frontend shows**: "N/A" for Patient ID
**Backend has**: PatientExternalId (string)

**Solution**: Ensure PatientExternalId is properly populated and displayed

## 📋 FRONTEND API CALLS NEEDED

### 1. Get Doctor's Referrals
```javascript
const getMyReferrals = async (status = null) => {
  const response = await api.get('/api/referrals/my-referrals', {
    params: { status }
  });
  return response.data;
};
```

### 2. Create New Referral (Already Works)
```javascript
const createReferral = async (referralData) => {
  const response = await api.post('/api/referrals', {
    patientExternalId: referralData.patientId,
    doctorId: referralData.doctorId, // Will be overridden by backend
    referralType: referralData.referralType,
    reason: referralData.reason,
    diagnosis: referralData.diagnosis || "",
    priority: referralData.priority, // Use "Normal" instead of "Routine"
    autoSend: true
  });
  return response.data;
};
```

## 🎯 IMMEDIATE ACTIONS REQUIRED

### Backend Changes:
1. ✅ Add `GetMyReferrals()` endpoint for current doctor
2. ✅ Update urgency mapping (Routine → Normal)
3. ✅ Ensure PatientExternalId is properly set
4. ✅ Add proper error handling

### Frontend Integration:
1. ✅ Update API calls to use new endpoint
2. ✅ Fix urgency values in UI
3. ✅ Handle date/time formatting properly
4. ✅ Add status color mapping

## 🔄 WORKFLOW MATCH

### Frontend Flow:
1. Doctor clicks "Referrals" → Loads referral list ❌ (Missing endpoint)
2. Doctor sees "Referral List (1)" → Shows 1 referral ❌ (Wrong endpoint)
3. Doctor clicks "+ Add Referral" → Creates referral ✅ (Works)
4. Doctor sees referral details → Shows formatted data ❌ (Data mismatch)

### Current Backend Status:
- ✅ Referral creation works
- ❌ Get current doctor's referrals missing
- ❌ Urgency value mismatch
- ❌ Patient ID display issue

## 📊 REQUIRED SERVICE UPDATES

```csharp
// Add to ReferralsController
private int GetUserId()
{
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
    return userIdClaim != null && int.TryParse(userIdClaim.Value, out var id) ? id : 0;
}
```

## 🚀 NEXT STEPS

1. **Implement missing endpoint** for current doctor's referrals
2. **Fix urgency/priority mapping** between frontend and backend  
3. **Test referral list display** with proper formatting
4. **Validate referral creation** flow
5. **Prepare for remaining Doctor screens**
