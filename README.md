# README - Billing System Backend

## ?? Project Overview

Complete standalone **Billing System** backend for a multi-department clinic (Orthopedic, Radiology, Physiotherapy). Built with **ASP.NET Core 8.0** using **Clean Architecture** principles.

---

## ? Key Features

? **Service Event Processing** - Receives billing events from clinic services  
? **Invoice Management** - Creates and manages invoices for patients  
? **Payment Processing** - Records payments with automatic status updates  
? **Idempotency** - Prevents duplicate invoices using unique keys  
? **Multi-Patient Support** - Internal PatientId or ExternalPatientId  
? **Comprehensive Reporting** - Patient and system-wide summaries  
? **Clean Architecture** - Repository pattern, Dependency Injection  
? **Async Operations** - All operations are non-blocking  
? **Structured Logging** - Full observability with Serilog  
? **Error Handling** - Comprehensive validation and error responses  

---

## ?? Project Structure

```
Billing_Backend/
??? Controllers/
?   ??? BillingController.cs         # API endpoints
??? Services/
?   ??? IBillingService.cs          # Service interface
?   ??? BillingService.cs           # Business logic
??? Data/
?   ??? BillingDbContext.cs         # EF Core context
?   ??? DTOs/
?   ?   ??? BillingDTOs.cs          # Data transfer objects
?   ??? Repositories/
?       ??? IInvoiceRepository.cs   # Invoice interface
?       ??? InvoiceRepository.cs    # Invoice implementation
?       ??? IPaymentRepository.cs   # Payment interface
?       ??? PaymentRepository.cs    # Payment implementation
??? Models/
?   ??? InvoiceModel.cs
?   ??? InvoiceItemModel.cs
?   ??? PaymentModel.cs
??? Enums/
?   ??? BillingEnums.cs
??? Mappings/
?   ??? BillingMappingProfile.cs    # AutoMapper configuration
??? BILLING_SYSTEM_GUIDE.md          # Complete documentation
??? BILLING_API_TESTING.md           # API testing guide
??? INTEGRATION_GUIDE.md             # Integration instructions
??? README.md                        # This file
```

---

## ?? Quick Start

### Prerequisites
- .NET 8.0 SDK
- SQL Server (local or remote)
- Visual Studio 2022 or VS Code

### 1. Clone/Navigate to Project
```bash
cd Billing_Backend
```

### 2. Restore NuGet Packages
```bash
dotnet restore
```

### 3. Configure Database
Edit `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "BillingConnection": "Server=YOUR_SERVER;Database=BillingSystemDb;Trusted_Connection=true;TrustServerCertificate=true;"
  }
}
```

### 4. Create Database & Migrations
```bash
# Create migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update
```

### 5. Run Application
```bash
dotnet run
```

Access Swagger UI: `https://localhost:5001/swagger`

---

## ?? Core Models

### Invoice
```csharp
public class InvoiceModel
{
    public int InvoiceId { get; set; }
    public int? PatientId { get; set; }
    public string? PatientExternalId { get; set; }
    public InvoiceStatus Status { get; set; }           // Pending, Partial, Paid
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public string? IdempotencyKey { get; set; }         // Duplicate prevention
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? SourceSystem { get; set; }
    public ICollection<InvoiceItemModel>? Items { get; set; }
    public ICollection<PaymentModel>? Payments { get; set; }
}
```

### InvoiceItem
```csharp
public class InvoiceItemModel
{
    public int InvoiceItemId { get; set; }
    public int InvoiceId { get; set; }
    public string ServiceName { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public int? ReferenceId { get; set; }              // Original service ID
    public string? ReferenceType { get; set; }         // Appointment, Consultation, Imaging, Therapy
    public DateTime CreatedAt { get; set; }
    public InvoiceModel? Invoice { get; set; }
}
```

### Payment
```csharp
public class PaymentModel
{
    public int PaymentId { get; set; }
    public int InvoiceId { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }   // Cash, Card, BankTransfer, etc.
    public string? TransactionId { get; set; }
    public string? ReferenceNumber { get; set; }
    public PaymentStatus Status { get; set; }          // Completed, Failed, Refunded
    public DateTime PaidAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Notes { get; set; }
    public InvoiceModel? Invoice { get; set; }
}
```

---

## ?? API Endpoints

### Service Events
```http
POST   /api/billing/events                              Create invoice from service event
```

### Invoices
```http
GET    /api/billing/{id}                               Get invoice by ID
GET    /api/billing/patient/{patientId}                Get patient invoices
GET    /api/billing/external-patient/{patientExternalId}  Get external patient invoices
GET    /api/billing/status/{status}                    Get invoices by status
```

### Payments
```http
POST   /api/billing/payments                           Process payment
GET    /api/billing/{invoiceId}/payments               Get invoice payments
```

### Summaries
```http
GET    /api/billing/summary/system                     System summary (Admin)
GET    /api/billing/summary/patient/{patientId}        Patient summary
GET    /api/billing/summary/external-patient/{patientExternalId}  External patient summary
```

---

## ?? Example Usage

### 1. Create Invoice from Service Event
```bash
POST /api/billing/events
Content-Type: application/json

{
  "patientId": 1,
  "serviceName": "Orthopedic Consultation",
  "price": 200.00,
  "referenceId": 5,
  "referenceType": "Appointment",
  "idempotencyKey": "appt-5-2026-04-24",
  "sourceSystem": "OrthopedicSystem"
}
```

### 2. Process Payment
```bash
POST /api/billing/payments
Content-Type: application/json
Authorization: Bearer {token}

{
  "invoiceId": 1,
  "amount": 200.00,
  "paymentMethod": "Card",
  "transactionId": "txn_123"
}
```

### 3. Get Patient Invoices
```bash
GET /api/billing/patient/1
Authorization: Bearer {token}
```

### 4. Get Patient Summary
```bash
GET /api/billing/summary/patient/1
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "patientId": 1,
    "totalInvoices": 3,
    "totalAmount": 600.00,
    "paidAmount": 500.00,
    "outstandingAmount": 100.00,
    "overallStatus": "Partial"
  }
}
```

---

## ?? Security

- **JWT Authentication** - Required for all endpoints except events
- **Role-Based Authorization** - Admin role for system summaries
- **Idempotency Keys** - Prevent duplicate invoice creation
- **Input Validation** - Comprehensive validation on all inputs
- **Error Handling** - Safe error messages without exposing internals

---

## ??? Database

### Tables
- `Invoices` - Invoice records
- `InvoiceItems` - Line items
- `Payments` - Payment transactions

### Indexes
- PatientId lookup
- PatientExternalId lookup
- Status queries
- Transaction ID uniqueness
- Creation date sorting

---

## ?? Status Flow

```
Pending ? (partial payment) ? Partial ? (final payment) ? Paid
   ?
   ??????? Cancelled
   ?
   ??????? Overdue
```

**Status Rules:**
- `Pending`: No payments received
- `Partial`: Some payments received, balance remaining
- `Paid`: All payments received
- `Cancelled`: Invoice cancelled
- `Overdue`: Payment not received by due date

---

## ?? Testing

See `BILLING_API_TESTING.md` for:
- Complete test scenarios
- PowerShell examples
- Error case testing
- Integration workflows

Quick test:
```bash
# Register user and get token
# POST /api/auth/login

# Create service event
# POST /api/billing/events

# Process payment
# POST /api/billing/payments

# Get results
# GET /api/billing/patient/1
```

---

## ?? Documentation

- **`BILLING_SYSTEM_GUIDE.md`** - Complete system documentation
- **`BILLING_API_TESTING.md`** - API testing guide with examples
- **`INTEGRATION_GUIDE.md`** - How to integrate with clinic system

---

## ?? Integration

To integrate with main clinic system:

1. Add service reference in main `Program.cs`
2. Configure connection string
3. Create migrations
4. Emit service events from clinic services
5. Listen for billing responses

See `INTEGRATION_GUIDE.md` for detailed steps.

---

## ?? Logging

Logs are created in `logs/billing-*.txt` with Serilog:
```
[10:30:45 INF] Service event processed successfully
[10:30:46 INF] Payment {PaymentId} processed successfully
[10:30:47 ERR] Error processing payment: Invoice not found
```

---

## ?? Error Handling

All errors return structured JSON responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Validation error
- `404` - Not found
- `500` - Server error

---

## ?? Business Logic

### Invoice Creation
1. Validate event
2. Check idempotency key
3. Find or create pending invoice
4. Add service item
5. Update total amount
6. Return invoice

### Payment Processing
1. Validate payment
2. Check outstanding balance
3. Create payment record
4. Update paid amount
5. Update invoice status based on:
   - `PaidAmount >= TotalAmount` ? Paid
   - `PaidAmount > 0` ? Partial
   - Otherwise ? Pending

---

## ?? Configuration

### Connection Strings
```json
{
  "ConnectionStrings": {
    "BillingConnection": "Server=localhost;Database=BillingSystemDb;Trusted_Connection=true;"
  }
}
```

### Logging
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning"
    }
  }
}
```

---

## ?? Contributing

Contributions welcome! Please follow:
- Clean Architecture principles
- Async/await patterns
- Comprehensive logging
- Unit tests for new features

---

## ?? License

This project is part of the Clinic Information System.

---

## ?? Support

For issues or questions:
1. Check documentation in `BILLING_SYSTEM_GUIDE.md`
2. Review `BILLING_API_TESTING.md` examples
3. Check logs in `logs/` directory
4. Review error messages for guidance

---

## ?? Features Checklist

- [x] Invoice management
- [x] Payment processing
- [x] Service event handling
- [x] Idempotency support
- [x] Multi-patient support (internal/external)
- [x] Status tracking
- [x] Payment history
- [x] Patient summaries
- [x] System reporting
- [x] Comprehensive logging
- [x] Error handling
- [x] API documentation
- [x] Integration guide

---

**Version**: 1.0  
**Status**: Production Ready ?  
**Last Updated**: 2026-04-24  
**Framework**: ASP.NET Core 8.0  
**Database**: SQL Server  
**Architecture**: Clean Architecture
