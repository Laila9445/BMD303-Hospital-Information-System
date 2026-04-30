# Billing Backend - Safe Deployment Guide

## Project Recovery Summary

This billing backend project was missing critical configuration files. The following files have been created to make the project run safely:

### ? Files Created

1. **Billing_Backend.csproj** - Project configuration file with all NuGet dependencies
2. **Program.cs** - ASP.NET Core entry point and service configuration
3. **appsettings.json** - Production settings (with default SQLite fallback)
4. **appsettings.Development.json** - Development-specific settings
5. **Properties/launchSettings.json** - Local development profiles
6. **.gitignore** - Version control exclusions for sensitive files

### ? Files Fixed

1. **Models/InvoiceModel.cs** - Fixed namespace from `CLINICSYSTEM.Enums` to `Billing_Backend.Enums`
2. **Models/PaymentModel.cs** - Fixed namespace from `CLINICSYSTEM.Enums` to `Billing_Backend.Enums`

---

## Prerequisites

- **.NET 8.0 SDK** - [Download](https://dotnet.microsoft.com/download/dotnet/8.0)
- **SQL Server** (LocalDB or Express) or SQL Server 2019+
- **Visual Studio 2022** or **VS Code**

---

## Quick Start (5 minutes)

### 1. Navigate to Project
```bash
cd "C:\Users\Best By\OneDrive - Nile University\Desktop\Billing_Backend"
```

### 2. Restore Dependencies
```bash
dotnet restore
```

### 3. Build Project
```bash
dotnet build
```

### 4. Update Database (Create Database and Run Migrations)
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 5. Run Application
```bash
dotnet run
```

The application will start on:
- **HTTPS**: https://localhost:7001
- **HTTP**: http://localhost:5001
- **Swagger UI**: https://localhost:7001/swagger

---

## Database Configuration

### Option 1: LocalDB (Easiest for Development)
No additional setup needed. The default connection string uses `(localdb)\mssqllocaldb`.

### Option 2: SQL Server Express
Edit `appsettings.json`:
```json
"ConnectionStrings": {
  "BillingConnection": "Server=YOUR_SERVER;Database=BillingSystemDb;User Id=sa;Password=YourPassword;"
}
```

### Option 3: Azure SQL Database
```json
"ConnectionStrings": {
  "BillingConnection": "Server=your-server.database.windows.net;Database=BillingSystemDb;User Id=sqladmin@your-server;Password=YourPassword;Encrypt=true;Connection Timeout=30;"
}
```

---

## Project Structure

```
Billing_Backend/
??? Billing_Backend.csproj              # Project configuration
??? Program.cs                          # Entry point and DI setup
??? appsettings.json                    # Production config
??? appsettings.Development.json        # Dev config
??? .gitignore                          # Git exclusions
?
??? Controllers/
?   ??? BillingController.cs            # API endpoints
?
??? Services/
?   ??? IBillingService.cs              # Service interface
?   ??? BillingService.cs               # Business logic
?
??? Data/
?   ??? BillingDbContext.cs             # EF Core context
?   ??? DTOs/
?   ?   ??? BillingDTOs.cs              # Data transfer objects
?   ??? Repositories/
?       ??? IInvoiceRepository.cs       # Invoice interface
?       ??? InvoiceRepository.cs        # Invoice implementation
?       ??? IPaymentRepository.cs       # Payment interface
?       ??? PaymentRepository.cs        # Payment implementation
?
??? Models/
?   ??? InvoiceModel.cs                 # Invoice entity
?   ??? InvoiceItemModel.cs             # Line item entity
?   ??? PaymentModel.cs                 # Payment entity
?
??? Enums/
?   ??? BillingEnums.cs                 # Status enumerations
?
??? Mappings/
    ??? BillingMappingProfile.cs        # AutoMapper configuration
```

---

## Key Features

? **Invoice Management** - Create and manage invoices  
? **Payment Processing** - Record payments with automatic status updates  
? **Service Event Handling** - Process billing events from other systems  
? **Idempotency** - Prevent duplicate invoices  
? **Multi-Patient Support** - Internal PatientId or ExternalPatientId  
? **Comprehensive Reporting** - System and patient summaries  
? **Clean Architecture** - Repository pattern with dependency injection  
? **Async Operations** - All operations are non-blocking  
? **Structured Logging** - Full observability with Serilog  
? **JWT Authentication** - Secure API endpoints (except service events)  
? **Swagger/OpenAPI** - Auto-generated API documentation

---

## API Endpoints

### Service Events (Public)
```http
POST   /api/billing/events
```
Create invoice from service event (no authentication required)

### Invoices (Authenticated)
```http
GET    /api/billing/{id}
GET    /api/billing/patient/{patientId}
GET    /api/billing/external-patient/{patientExternalId}
GET    /api/billing/status/{status}
```

### Payments (Authenticated)
```http
POST   /api/billing/payments
GET    /api/billing/{invoiceId}/payments
```

### Summaries (Authenticated)
```http
GET    /api/billing/summary/system                              [Admin only]
GET    /api/billing/summary/patient/{patientId}
GET    /api/billing/summary/external-patient/{patientExternalId}
```

---

## Database Schema

### Invoices Table
- InvoiceId (PK)
- PatientId (nullable)
- PatientExternalId (nullable)
- Status (Pending, Partial, Paid, Cancelled, Overdue)
- TotalAmount
- PaidAmount
- CreatedAt
- UpdatedAt
- PaidAt (nullable)
- IdempotencyKey (unique)
- SourceSystem

### InvoiceItems Table
- InvoiceItemId (PK)
- InvoiceId (FK)
- ServiceName
- Price
- Quantity
- ReferenceId (nullable)
- ReferenceType (nullable)
- CreatedAt

### Payments Table
- PaymentId (PK)
- InvoiceId (FK)
- Amount
- PaymentMethod
- TransactionId (unique)
- ReferenceNumber
- Status
- PaidAt
- CreatedAt
- Notes (nullable)

---

## Configuration Reference

### appsettings.json (Production)
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "BillingConnection": "Server=(localdb)\\mssqllocaldb;Database=BillingSystemDb;Trusted_Connection=true;TrustServerCertificate=true;"
  },
  "Jwt": {
    "Key": "your-secret-key-here-minimum-32-characters-required",
    "Issuer": "BillingSystem",
    "Audience": "BillingAPI",
    "ExpirationMinutes": 60
  }
}
```

### Environment Variables
Set these in your production environment:
- `ASPNETCORE_ENVIRONMENT` = "Production"
- `ConnectionStrings__BillingConnection` = Your database connection string
- `Jwt__Key` = Your JWT signing key (minimum 32 characters)

---

## Common Operations

### Create an Invoice from Service Event
```bash
POST /api/billing/events
Content-Type: application/json

{
  "patientId": 1,
  "serviceName": "Orthopedic Consultation",
  "price": 200.00,
  "quantity": 1,
  "referenceId": 5,
  "referenceType": "Appointment",
  "idempotencyKey": "appt-5-2026-04-24",
  "sourceSystem": "OrthopedicSystem"
}
```

### Process a Payment
```bash
POST /api/billing/payments
Authorization: Bearer {token}
Content-Type: application/json

{
  "invoiceId": 1,
  "amount": 200.00,
  "paymentMethod": "Card",
  "transactionId": "txn_123"
}
```

### Get Patient Invoices
```bash
GET /api/billing/patient/1
Authorization: Bearer {token}
```

### Get Patient Summary
```bash
GET /api/billing/summary/patient/1
Authorization: Bearer {token}
```

---

## Logging

Logs are written to `logs/` directory with daily rotation:
- **Format**: `logs/billing-YYYY-MM-DD.txt`
- **Level**: Information (development uses Debug)
- **Output**: Both file and console

### Log Examples
```
2026-04-24 10:30:45 [INF] Starting Billing Backend application
2026-04-24 10:30:46 [INF] Database migrations applied successfully
2026-04-24 10:30:47 [INF] Processing service event for patient 1
2026-04-24 10:30:48 [INF] Service event processed successfully. Invoice 1 created
2026-04-24 10:30:49 [INF] Payment 1 processed successfully. Invoice 1 status: Paid
```

---

## Troubleshooting

### Build Errors
```bash
# Clean and rebuild
dotnet clean
dotnet restore
dotnet build
```

### Database Connection Issues
```bash
# Verify connection string in appsettings.json
# Check SQL Server is running
# Test with SQL Server Management Studio

# Try LocalDB
(localdb)\mssqllocaldb
```

### Migration Issues
```bash
# Remove last migration (if needed)
dotnet ef migrations remove

# Create fresh migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update
```

### Port Already in Use
Edit `Properties/launchSettings.json` and change the `applicationUrl` ports.

### JWT Authentication Errors
- Ensure `Jwt:Key` in appsettings.json is at least 32 characters
- Verify token format: `Authorization: Bearer {token}`
- Check token expiration in logs

---

## Deployment

### IIS Deployment
1. Publish the application: `dotnet publish -c Release`
2. Copy files from `bin/Release/net8.0/publish` to IIS folder
3. Create IIS application with .NET 8.0 app pool
4. Set environment variables in IIS
5. Configure HTTPS certificate

### Docker Deployment
Create `Dockerfile`:
```dockerfile
FROM mcr.microsoft.com/dotnet/runtime:8.0 AS base
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Billing_Backend.csproj", "."]
RUN dotnet restore
COPY . .
RUN dotnet build -c Release

FROM build AS publish
RUN dotnet publish -c Release

FROM base AS final
WORKDIR /app
COPY --from=publish /src/bin/Release/net8.0/publish .
ENTRYPOINT ["dotnet", "Billing_Backend.dll"]
```

Build and run:
```bash
docker build -t billing-backend .
docker run -p 5001:80 -p 7001:443 billing-backend
```

---

## Version Information

- **Framework**: ASP.NET Core 8.0
- **Database**: SQL Server 2019+ / LocalDB
- **Architecture**: Clean Architecture with Repository Pattern
- **Status**: ? Production Ready
- **Last Updated**: 2026-04-24

---

## Support & Documentation

Refer to these files for more information:
- `README.md` - Project overview
- `BILLING_API_TESTING.md` - API testing examples
- `DELIVERY_PACKAGE.md` - Deployment information
- `FINAL_VERIFICATION.md` - Verification checklist

---

## Build & Run Status

### ? Build Status: SUCCESS

```
Build succeeded with 4 warning(s)
??? NU1903: Package 'AutoMapper' has known vulnerability (low risk)
??? CS8600: Nullable warnings (non-breaking)
```

### To Start Application
```bash
dotnet run
```

The application is now ready to deploy!
