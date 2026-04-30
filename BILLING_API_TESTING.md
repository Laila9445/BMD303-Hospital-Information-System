# API Testing Guide - Billing System

## Using Swagger UI

1. Start the application: `dotnet run`
2. Navigate to: https://localhost:5001/swagger
3. Click "Authorize" button
4. Enter: `Bearer {your-token}`

---

## Sample API Calls

### 1. Register Admin User (for system summary access)
```json
POST /api/auth/register
{
  "email": "admin@clinic.com",
  "password": "Admin123!",
  "firstName": "Admin",
  "lastName": "User",
  "role": "Admin"
}
```

### 2. Login
```json
POST /api/auth/login
{
  "email": "admin@clinic.com",
  "password": "Admin123!"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "userId": 1,
    "email": "admin@clinic.com",
    "role": "Admin"
  }
}
```

---

## Billing System API Calls

### 1. Create Invoice from Orthopedic Appointment
```http
POST /api/billing/events
Content-Type: application/json

{
  "patientId": 1,
  "serviceName": "Orthopedic Consultation",
  "price": 200.00,
  "description": "Initial consultation for knee pain",
  "quantity": 1,
  "referenceId": 5,
  "referenceType": "Appointment",
  "idempotencyKey": "appt-5-2026-04-24-001",
  "sourceSystem": "OrthopedicSystem"
}
```

Expected: `201 Created`
```json
{
  "success": true,
  "data": {
    "invoiceId": 1,
    "patientId": 1,
    "patientExternalId": null,
    "status": "Pending",
    "totalAmount": 200.00,
    "paidAmount": 0.00,
    "createdAt": "2026-04-24T10:30:00.123Z",
    "updatedAt": "2026-04-24T10:30:00.123Z",
    "sourceSystem": "OrthopedicSystem",
    "items": [
      {
        "invoiceItemId": 1,
        "serviceName": "Orthopedic Consultation",
        "description": "Initial consultation for knee pain",
        "price": 200.00,
        "quantity": 1,
        "referenceId": 5,
        "referenceType": "Appointment",
        "createdAt": "2026-04-24T10:30:00.123Z"
      }
    ]
  }
}
```

### 2. Add Therapy Service to Existing Invoice
```http
POST /api/billing/events
Content-Type: application/json

{
  "patientId": 1,
  "serviceName": "Physiotherapy Session",
  "price": 150.00,
  "description": "First session - knee rehabilitation",
  "quantity": 1,
  "referenceId": 10,
  "referenceType": "TherapySession",
  "idempotencyKey": "therapy-10-2026-04-24-001",
  "sourceSystem": "PhysiotherapySystem"
}
```

Expected: `200 OK` (Invoice 1 updated)
```json
{
  "success": true,
  "data": {
    "invoiceId": 1,
    "patientId": 1,
    "status": "Pending",
    "totalAmount": 350.00,
    "paidAmount": 0.00,
    "items": [
      { "serviceName": "Orthopedic Consultation", "price": 200.00 },
      { "serviceName": "Physiotherapy Session", "price": 150.00 }
    ]
  }
}
```

### 3. Add Imaging Service
```http
POST /api/billing/events
Content-Type: application/json

{
  "patientId": 1,
  "serviceName": "X-Ray Imaging",
  "price": 250.00,
  "description": "Knee X-ray - 2 views",
  "quantity": 1,
  "referenceId": 15,
  "referenceType": "Imaging",
  "idempotencyKey": "imaging-15-2026-04-24-001",
  "sourceSystem": "RadiologySystem"
}
```

Expected: `200 OK`
Total Amount: $600.00

### 4. Get Invoice by ID
```http
GET /api/billing/1
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": {
    "invoiceId": 1,
    "patientId": 1,
    "status": "Pending",
    "totalAmount": 600.00,
    "paidAmount": 0.00,
    "createdAt": "2026-04-24T10:30:00Z",
    "items": [
      { "serviceName": "Orthopedic Consultation", "price": 200.00 },
      { "serviceName": "Physiotherapy Session", "price": 150.00 },
      { "serviceName": "X-Ray Imaging", "price": 250.00 }
    ]
  }
}
```

### 5. Process Partial Payment
```http
POST /api/billing/payments
Content-Type: application/json
Authorization: Bearer {token}

{
  "invoiceId": 1,
  "amount": 300.00,
  "paymentMethod": "Card",
  "transactionId": "txn_stripe_001",
  "notes": "Initial payment via Visa"
}
```

Expected: `200 OK`
```json
{
  "success": true,
  "data": {
    "paymentId": 1,
    "invoiceId": 1,
    "amount": 300.00,
    "paymentMethod": "Card",
    "transactionId": "txn_stripe_001",
    "referenceNumber": "PAY-20260424103045-A1B2C3D4",
    "status": "Completed",
    "paidAt": "2026-04-24T10:30:45Z"
  }
}
```

**Note**: Invoice 1 status changes to `Partial`

### 6. Get Invoice - Verify Status Changed
```http
GET /api/billing/1
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": {
    "invoiceId": 1,
    "patientId": 1,
    "status": "Partial",
    "totalAmount": 600.00,
    "paidAmount": 300.00,
    "items": [...]
  }
}
```

### 7. Process Final Payment
```http
POST /api/billing/payments
Content-Type: application/json
Authorization: Bearer {token}

{
  "invoiceId": 1,
  "amount": 300.00,
  "paymentMethod": "Cash",
  "notes": "Remaining balance - paid at clinic"
}
```

Expected: `200 OK`

**Note**: Invoice 1 status changes to `Paid`, `paidAt` is set

### 8. Get Invoice - Verify Payment Complete
```http
GET /api/billing/1
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": {
    "invoiceId": 1,
    "status": "Paid",
    "totalAmount": 600.00,
    "paidAmount": 600.00,
    "paidAt": "2026-04-24T10:31:30Z"
  }
}
```

### 9. Get Patient Invoices
```http
GET /api/billing/patient/1
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "invoiceId": 1,
      "patientId": 1,
      "status": "Paid",
      "totalAmount": 600.00,
      "paidAmount": 600.00
    }
  ]
}
```

### 10. Get Payment History for Invoice
```http
GET /api/billing/1/payments
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "paymentId": 1,
      "invoiceId": 1,
      "amount": 300.00,
      "paymentMethod": "Card",
      "referenceNumber": "PAY-20260424103045-A1B2C3D4",
      "status": "Completed",
      "paidAt": "2026-04-24T10:30:45Z"
    },
    {
      "paymentId": 2,
      "invoiceId": 1,
      "amount": 300.00,
      "paymentMethod": "Cash",
      "status": "Completed",
      "paidAt": "2026-04-24T10:31:30Z"
    }
  ]
}
```

### 11. Get Patient Summary
```http
GET /api/billing/summary/patient/1
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": {
    "patientId": 1,
    "totalInvoices": 1,
    "totalAmount": 600.00,
    "paidAmount": 600.00,
    "outstandingAmount": 0.00,
    "overallStatus": "Paid",
    "recentInvoices": [
      {
        "invoiceId": 1,
        "status": "Paid",
        "totalAmount": 600.00
      }
    ]
  }
}
```

### 12. Get System Summary (Admin Only)
```http
GET /api/billing/summary/system
Authorization: Bearer {admin-token}
```

Response:
```json
{
  "success": true,
  "data": {
    "totalInvoices": 10,
    "paidInvoices": 6,
    "pendingInvoices": 2,
    "partialInvoices": 2,
    "totalAmount": 3500.00,
    "paidAmount": 2800.00,
    "pendingAmount": 700.00
  }
}
```

### 13. Get Invoices by Status
```http
GET /api/billing/status/Pending
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "invoiceId": 2,
      "patientId": 2,
      "status": "Pending",
      "totalAmount": 400.00,
      "paidAmount": 0.00
    },
    {
      "invoiceId": 3,
      "patientId": 3,
      "status": "Pending",
      "totalAmount": 300.00,
      "paidAmount": 0.00
    }
  ]
}
```

### 14. Test External Patient ID
```http
POST /api/billing/events
Content-Type: application/json

{
  "patientExternalId": "EXT-PATIENT-001",
  "serviceName": "Consultation",
  "price": 100.00,
  "idempotencyKey": "ext-001-2026-04-24",
  "sourceSystem": "ExternalClinic"
}
```

### 15. Get External Patient Invoices
```http
GET /api/billing/external-patient/EXT-PATIENT-001
Authorization: Bearer {token}
```

---

## Testing with PowerShell

### Test Service Event Processing
```powershell
$body = @{
    patientId = 1
    serviceName = "Orthopedic Consultation"
    price = 200
    quantity = 1
    referenceId = 5
    referenceType = "Appointment"
    idempotencyKey = "appt-5-2026-04-24"
    sourceSystem = "OrthopedicSystem"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://localhost:5001/api/billing/events" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"

$response | ConvertTo-Json
```

### Test Payment Processing
```powershell
$token = "YOUR_JWT_TOKEN"

$headers = @{
    Authorization = "Bearer $token"
}

$paymentBody = @{
    invoiceId = 1
    amount = 200
    paymentMethod = "Card"
    transactionId = "txn_123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://localhost:5001/api/billing/payments" `
    -Method Post `
    -Body $paymentBody `
    -ContentType "application/json" `
    -Headers $headers

$response | ConvertTo-Json
```

### Test Duplicate Prevention
```powershell
# First call - creates invoice
$body = @{
    patientId = 1
    serviceName = "Test Service"
    price = 100
    idempotencyKey = "unique-key-123"
} | ConvertTo-Json

$response1 = Invoke-RestMethod -Uri "https://localhost:5001/api/billing/events" `
    -Method Post -Body $body -ContentType "application/json"

$invoiceId1 = $response1.data.invoiceId

# Second call with same idempotency key - should return same invoice
$response2 = Invoke-RestMethod -Uri "https://localhost:5001/api/billing/events" `
    -Method Post -Body $body -ContentType "application/json"

$invoiceId2 = $response2.data.invoiceId

if ($invoiceId1 -eq $invoiceId2) {
    Write-Host "? Idempotency working correctly"
} else {
    Write-Host "? Idempotency failed"
}
```

---

## Error Testing

### Test 1: Missing Required Fields
```http
POST /api/billing/events
{
  "serviceName": "Service",
  "price": 100
}
```

Expected: `400 Bad Request`
```json
{
  "success": false,
  "message": "Either PatientId or PatientExternalId must be provided"
}
```

### Test 2: Overpayment
```http
POST /api/billing/payments
{
  "invoiceId": 1,
  "amount": 1000,
  "paymentMethod": "Card"
}
```

Expected: `400 Bad Request`
```json
{
  "success": false,
  "message": "Payment amount ($1000) exceeds outstanding balance ($600)"
}
```

### Test 3: Invalid Invoice
```http
GET /api/billing/9999
Authorization: Bearer {token}
```

Expected: `404 Not Found`
```json
{
  "success": false,
  "message": "Invoice not found"
}
```

### Test 4: Negative Price
```http
POST /api/billing/events
{
  "patientId": 1,
  "serviceName": "Service",
  "price": -100
}
```

Expected: `400 Bad Request`
```json
{
  "success": false,
  "message": "Price cannot be negative"
}
```

---

## Status Code Reference

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Invoice retrieved/payment processed |
| 201 | Created | New invoice created |
| 400 | Bad Request | Validation error |
| 404 | Not Found | Invoice not found |
| 500 | Server Error | Database error |

---

## Complete Workflow

1. ? Patient books appointment (OrthopedicSystem)
2. ? Service event triggers: Invoice created ($200)
3. ? Patient undergoes therapy (PhysiotherapySystem)
4. ? Service event triggers: Item added to invoice ($150)
5. ? Patient gets imaging done (RadiologySystem)
6. ? Service event triggers: Item added to invoice ($250)
7. ? Invoice total: $600 (Status: Pending)
8. ? Patient pays $300 (Status: Partial)
9. ? Patient pays $300 (Status: Paid)
10. ? Invoice complete

---

**Version**: 1.0  
**Last Updated**: 2026-04-24
