# API Testing Guide
cd 
## Using Swagger UI

1. Start the application: `dotnet run`
2. Navigate to: https://localhost:5001/swagger
3. Click "Authorize" button
4. Enter: `Bearer {your-token}` (get token from login endpoint)

## Sample API Calls

### 1. Register a Patient
```json
POST /api/auth/register
{
  "email": "patient@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+201234567890",
  "role": "Patient",
  "gender": "Male",
  "dateOfBirth": "1990-01-01"
}
```

### 2. Register a Doctor
```json
POST /api/auth/register
{
  "email": "doctor@example.com",
  "password": "Password123!",
  "firstName": "Dr. Ahmed",
  "lastName": "Nabil",
  "phoneNumber": "+201234567891",
  "role": "Doctor",
  "specialization": "Orthopedic Specialist"
}
```

### 3. Login
```json
POST /api/auth/login
{
  "email": "patient@example.com",
  "password": "Password123!"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "userId": 1,
    "email": "patient@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "Patient"
  }
}
```

### 4. Get Available Time Slots
```
GET /api/appointments/available-slots?doctorId=1&startDate=2025-12-20&endDate=2025-12-27
Authorization: Bearer {token}
```

### 5. Book Appointment
```json
POST /api/appointments/book
Authorization: Bearer {patient-token}
{
  "doctorId": 1,
  "timeSlotId": 5,
  "reasonForVisit": "Knee pain"
}
```

### 6. Start Consultation (Doctor)
```json
POST /api/consultations/start
Authorization: Bearer {doctor-token}
{
  "appointmentId": 1
}
```

### 7. Create Prescription (Doctor)
```json
POST /api/prescriptions
Authorization: Bearer {doctor-token}
{
  "consultationId": 1,
  "medicationName": "Ibuprofen",
  "dosage": "400mg",
  "frequency": "Twice daily",
  "durationDays": 7,
  "instructions": "Take with food",
  "warnings": "Do not exceed recommended dosage"
}
```

### 8. Upload Medical Image (Patient)
```
POST /api/medical-images/upload
Authorization: Bearer {patient-token}
Content-Type: multipart/form-data

file: [image file]
imageType: "X-ray"
description: "Knee X-ray"
```

### 9. Generate Prescription PDF
```
GET /api/prescriptions/1/pdf
Authorization: Bearer {token}
```

## Testing with PowerShell

### Register User
```powershell
$body = @{
    email = "test@example.com"
    password = "Password123!"
    firstName = "Test"
    lastName = "User"
    phoneNumber = "+201234567890"
    role = "Patient"
    gender = "Male"
    dateOfBirth = "1990-01-01"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://localhost:5001/api/auth/register" -Method Post -Body $body -ContentType "application/json"
```

### Login and Get Token
```powershell
$loginBody = @{
    email = "test@example.com"
    password = "Password123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://localhost:5001/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $response.token
```

### Use Token for Authenticated Request
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "https://localhost:5001/api/patients/profile" -Method Get -Headers $headers
```

## Testing Validation

### Invalid Email
```json
POST /api/auth/register
{
  "email": "invalid-email",
  "password": "Password123!",
  ...
}
```
Expected: 400 Bad Request with validation error

### Short Password
```json
POST /api/auth/register
{
  "email": "test@example.com",
  "password": "123",
  ...
}
```
Expected: 400 Bad Request - "Password must be at least 6 characters"

### Invalid File Type
```
POST /api/medical-images/upload
file: document.exe
```
Expected: 400 Bad Request - File type not allowed

### Large File
Upload file > 10MB
Expected: 400 Bad Request - File size exceeds limit

## Rate Limiting Test

Make 101 requests within 1 minute:
```powershell
for ($i = 1; $i -le 101; $i++) {
    Invoke-RestMethod -Uri "https://localhost:5001/api/patients/profile" -Headers $headers
}
```
Expected: 429 Too Many Requests after 100 requests
