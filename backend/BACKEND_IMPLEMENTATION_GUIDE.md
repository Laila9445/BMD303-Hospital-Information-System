# Backend Implementation Completion Guide
## Matching Your Clinic_UI Backend Description

### Status: In Progress ?
This document guides implementing all remaining features to match your backend description completely.

---

## ?? Implementation Checklist

### Phase 1: Authentication & Authorization ?
- [x] Global Exception Middleware with JSON error envelope
- [x] BusinessException with machine codes and custom HTTP status
- [x] JWT Authentication configured in Program.cs
- [x] Role-based authorization policies (Doctor, Patient, Admin, Staff)
- [ ] **TODO:** Create/Verify AuthController with all auth endpoints
  - POST /api/auth/register (accepts Doctor|Patient role)
  - POST /api/auth/login (returns token + user profile)
  - GET /api/auth/profile (current user, role-specific data)

### Phase 2: Doctor APIs ? (Mostly Complete)
- [ ] **TODO:** Verify all doctor endpoints
  - GET /api/doctors/profile ? view own profile
  - PUT /api/doctors/profile ? update profile
  - GET /api/doctors/appointments/today ? today's appointments
  - GET /api/doctors/appointments ? appointments by date/filter
  - GET /api/doctors/patients/search ? search patients
  - GET /api/doctors/patients/{id} ? patient details
  - POST /api/doctors/schedule ? create working schedule
  - GET /api/doctors/schedule ? list schedules
  - PUT/DELETE /api/doctors/schedule/{id} ? update/remove schedule

### Phase 3: Patient APIs ? (Mostly Complete)
- [ ] **TODO:** Verify all patient endpoints
  - GET /api/patients/profile ? view profile
  - PUT /api/patients/profile ? update profile
  - GET /api/patients/medical-history ? view
  - PUT /api/patients/medical-history ? update
  - GET /api/patients/appointments ? list own appointments
  - GET /api/patients/prescriptions ? list prescriptions
  - POST /api/patients/medical-images/upload ? upload image
  - GET /api/patients/medical-images ? list images

### Phase 4: Appointments ? (Complete)
- [x] GET /api/appointments/available-slots
- [x] POST /api/appointments/book
- [x] PUT /api/appointments/reschedule/{id}
- [x] PUT /api/appointments/cancel/{id}

### Phase 5: Consultations ? (Mostly Complete)
- [ ] **TODO:** Verify all consultation endpoints
  - POST /api/consultations/start (Doctor only)
  - PUT /api/consultations/{id} (update notes)
  - PUT /api/consultations/{id}/end (end consultation)
  - GET /api/consultations/{id} (details)

### Phase 6: Prescriptions ? (Mostly Complete)
- [ ] **TODO:** Verify all prescription endpoints
  - POST /api/prescriptions (create)
  - POST /api/prescriptions/bulk (create many)
  - GET /api/prescriptions/{id} (details)
  - GET /api/prescriptions/{id}/pdf (download PDF)
  - PUT/DELETE /api/prescriptions/{id} (update/remove)

### Phase 7: Medical Images ? (Mostly Complete)
- [ ] **TODO:** Verify all medical image endpoints
  - POST /api/medical-images/upload (multipart, with validation)
  - GET /api/medical-images (list)
  - GET /api/medical-images/{id}/download (download)
  - DELETE /api/medical-images/{id} (delete)
  - File type validation (X-ray, MRI, etc.)
  - File size limit enforcement (max 10MB default)

### Phase 8: Notifications ? (Mostly Complete)
- [ ] **TODO:** Verify all notification endpoints
  - GET /api/notifications (list user's notifications)
  - PUT /api/notifications/{id}/read (mark as read)
  - DELETE /api/notifications/{id} (remove)

### Phase 9: Data Models ? (Complete)
- [x] User: id, name, email, phone, role (Doctor|Patient), DOB, gender, address
- [x] Doctor: userId, specialization, license number, schedules
- [x] Patient: userId, emergency contact, medical history, images
- [x] DoctorSchedule / TimeSlot: recurring day/time, slot duration, generated slots
- [x] Appointment: id, doctorId, patientId, date, start/end, status, reason
- [x] Consultation: appointmentId, start/end, status, symptoms, diagnosis, notes
- [x] Prescription: consultationId, medications, expiry, status
- [x] Medication (line item): drug name, dosage, frequency, duration, instructions
- [x] MedicalImage: patientId, file path, type (X-ray/MRI), body part
- [x] Notification: userId, type, title, message, status

### Phase 10: Business Logic & Validation ?
- [x] Global exception middleware returns standard envelope
- [x] FluentValidation integrated with middleware
- [x] ValidationFailedException for structured field errors
- [x] BusinessException for domain errors (slot unavailable, invalid transition, etc.)
- [x] Role-based access control enforced
- [x] Resource ownership validation
- [x] Rate limiting (100 req/min per user)
- [x] Input validation on all DTOs

### Phase 11: External Integrations ??
- [ ] **TODO:** Email Service (SMTP/SendGrid)
  - Appointment confirmations
  - Reminders
  - Prescription notifications
- [ ] **TODO:** SMS Service (Twilio) - Optional
  - Urgent reminders
- [ ] **TODO:** Cloud File Storage (Azure Blob / AWS S3)
  - Medical image upload/download
  - Currently: Local file storage
- [ ] **TODO:** PDF Generator
  - Prescription PDF export
  - Currently: Using QuestPDF

### Phase 12: Security & Non-Functional ?
- [x] JWT Bearer tokens (24-hour expiry)
- [x] Role-based access control
- [x] Resource ownership enforcement
- [x] Rate limiting (per-user)
- [x] Structured logging (Serilog)
- [x] HTTPS/TLS redirection
- [x] File upload validation (type + size)
- [x] Input validation server-side
- [ ] **TODO:** Virus/malware checks on file uploads
- [ ] **TODO:** CORS configured for frontend domain (currently AllowAll)

---

## ?? Quick Implementation Plan

### Step 1: Verify Existing Controllers (5 minutes)
Scan these controller files to ensure all endpoints from the description exist:
- `backend/Controllers/AuthController.cs` ? Check for register/login/profile
- `backend/Controllers/DoctorsController.cs` ? Check all doctor endpoints
- `backend/Controllers/PatientsController.cs` ? Check all patient endpoints
- `backend/Controllers/AppointmentsController.cs` ? All appointment endpoints
- `backend/Controllers/ConsultationsController.cs` ? All consultation endpoints
- `backend/Controllers/PrescriptionsController.cs` ? All prescription endpoints
- `backend/Controllers/MedicalImagesController.cs` ? All image endpoints
- `backend/Controllers/NotificationsController.cs` ? All notification endpoints

### Step 2: Add Missing Endpoints (2-3 hours)
If any endpoint from the description is missing, implement it:
- Create DTOs for request/response
- Add service method in corresponding service
- Add controller action with proper authorization attributes
- Ensure proper error handling with BusinessException

### Step 3: Integrate Services (1 hour)
Ensure services throw proper exceptions:
```csharp
// Example: In AppointmentService.cs
public async Task<AppointmentDTO> BookAppointmentAsync(int patientId, BookAppointmentRequest request)
{
    // Validate slot availability
    var slots = await GetAvailableSlotsAsync(request.DoctorId, request.Date);
    if (!slots.Any(s => s.TimeSlotId == request.TimeSlotId))
    {
        throw new SlotUnavailableException("The selected slot is no longer available.");
    }
    
    // ... rest of booking logic
}
```

### Step 4: Wire FluentValidation Errors (30 minutes)
Ensure all validation errors are caught and converted to 422:
- Middleware already handles `ValidationException`
- Controllers automatically validate with `[ValidateModel]` attribute
- Field errors appear in `fieldErrors` response envelope

### Step 5: Add External Services (Optional - 2 hours)
Configure and inject email, SMS, cloud storage:
```csharp
// In Program.cs
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ISmsService, SmsService>();
builder.Services.AddScoped<IFileStorageService, FileStorageService>();
```

### Step 6: Test All Endpoints (1-2 hours)
Use Swagger UI or Postman:
1. Register as Doctor and Patient
2. Login and verify JWT token
3. Test all endpoints with proper authorization
4. Verify error responses match the standard envelope

---

## ?? API Response Examples

### Success Response (200 OK)
```json
{
  "success": true,
  "data": { /* resource data */ },
  "message": "Operation successful"
}
```

### Validation Error (422 Unprocessable Entity)
```json
{
  "status": 422,
  "code": "ERR_VALIDATION",
  "message": "Validation failed",
  "fieldErrors": {
    "email": ["Email is invalid"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

### Business Error (409 Conflict)
```json
{
  "status": 409,
  "code": "ERR_SLOT_UNAVAILABLE",
  "message": "The requested appointment slot is not available."
}
```

### Authorization Error (403 Forbidden)
```json
{
  "status": 403,
  "code": "ERR_ACCESS_DENIED",
  "message": "You do not have permission to access this resource."
}
```

---

## ?? Key Files to Verify/Update

| File | Purpose | Status |
|------|---------|--------|
| `backend/Middleware/GlobalExceptionHandler.cs` | Global error handling | ? Complete |
| `backend/Exceptions/BusinessException.cs` | Domain exceptions | ? Complete |
| `backend/Program.cs` | Service registration & middleware | ? Complete |
| `backend/Controllers/AuthController.cs` | Authentication endpoints | ?? Verify |
| `backend/Controllers/DoctorsController.cs` | Doctor endpoints | ?? Verify |
| `backend/Controllers/PatientsController.cs` | Patient endpoints | ?? Verify |
| `backend/Controllers/AppointmentsController.cs` | Appointment endpoints | ?? Verify |
| `backend/Controllers/ConsultationsController.cs` | Consultation endpoints | ?? Verify |
| `backend/Controllers/PrescriptionsController.cs` | Prescription endpoints | ?? Verify |
| `backend/Controllers/MedicalImagesController.cs` | Image endpoints | ?? Verify |
| `backend/Controllers/NotificationsController.cs` | Notification endpoints | ?? Verify |
| `backend/Services/IAuthenticationService.cs` | Auth service interface | ?? Verify |
| `backend/Services/IDoctorService.cs` | Doctor service interface | ?? Verify |
| `backend/Services/IAppointmentService.cs` | Appointment service interface | ?? Verify |
| `backend/Data/ClinicDbContext.cs` | EF Core DbContext | ? Complete |

---

## ?? Common Patterns to Follow

### 1. Authorization on Endpoint
```csharp
[HttpGet("profile")]
[Authorize(Roles = "Doctor,Patient")]
public async Task<IActionResult> GetProfile()
{
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    // ... get and return user profile
}
```

### 2. Throwing Business Exception
```csharp
if (appointment.Status == "Completed")
{
    throw new CannotCancelCompletedAppointmentException();
}
```

### 3. Handling File Upload with Validation
```csharp
[HttpPost("upload")]
[Authorize(Roles = "Patient")]
public async Task<IActionResult> UploadImage([FromForm] UploadMedicalImageRequest request)
{
    if (request.File.Length > 10 * 1024 * 1024) // 10MB
    {
        throw new FileSizeExceededException(request.File.Length, 10 * 1024 * 1024);
    }
    
    var allowedTypes = new[] { "image/jpeg", "image/png", "image/x-ray" };
    if (!allowedTypes.Contains(request.File.ContentType))
    {
        throw new InvalidFileTypeException(
            Path.GetExtension(request.File.FileName),
            "jpg, png, dcm"
        );
    }
    // ... proceed with upload
}
```

### 4. Validating Resource Ownership
```csharp
var appointment = await _appointmentService.GetAppointmentAsync(appointmentId);
if (appointment.PatientId != userId && appointment.DoctorId != userId)
{
    throw new AccessDeniedException("You can only access your own appointments.");
}
```

---

## ?? Next Steps

Choose one:

1. **Scan & Report** - I generate a list of which endpoints exist vs missing
2. **Implement Missing** - I add all missing endpoints
3. **Test All** - I create integration tests for all endpoints
4. **Wire Services** - I ensure all services throw BusinessException properly

What would you like me to do first?
