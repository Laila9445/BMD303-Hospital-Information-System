# Clinic Information System - Backend Setup Guide

## Prerequisites
- .NET 8.0 SDK
- SQL Server (Express or full version)
- Visual Studio 2022 or VS Code

## Initial Setup

### 1. Restore NuGet Packages
```powershell
cd backend
dotnet restore
```

### 2. Configure Database Connection
Update `appsettings.json` with your SQL Server connection string:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=.;Database=ClinicSystemDb;Trusted_Connection=True;Encrypt=false;"
}
```

For SQL Server with username/password:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=your-server;Database=ClinicSystemDb;User Id=your-user;Password=your-password;Encrypt=false;"
}
```

### 3. Update JWT Secret Key
Change the JWT secret key in `appsettings.json`:
```json
"JwtSettings": {
  "SecretKey": "YOUR-STRONG-SECRET-KEY-AT-LEAST-32-CHARACTERS-LONG",
  "ExpirationMinutes": 1440
}
```

### 4. Create Database Migrations
```powershell
dotnet ef migrations add InitialCreate
```

### 5. Update Database
```powershell
dotnet ef database update
```

### 6. Run the Application
```powershell
dotnet run
```

The API will be available at:
- HTTPS: https://localhost:5001
- HTTP: http://localhost:5000
- Swagger UI: https://localhost:5001/swagger

## Features Implemented

### ✅ Core Functionality
- JWT Authentication & Authorization
- Role-based access control (Doctor/Patient)
- Patient management & medical records
- Doctor scheduling & appointments
- Consultation management
- Prescription management with PDF generation
- Medical image upload/download
- Notification system

### ✅ Security Features
- HTTPS/TLS encryption
- JWT token authentication
- Role-based authorization
- Input validation on all DTOs
- Rate limiting (100 requests/minute per user)
- Global exception handling
- Serilog audit logging

### ✅ Performance Features
- Memory caching for frequently accessed data
- Asynchronous operations throughout
- EF Core query optimization
- Connection pooling

### ✅ Production Ready
- Comprehensive error handling
- Structured logging with Serilog
- File upload validation (size & type)
- PDF generation with QuestPDF
- Swagger/OpenAPI documentation

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Patients
- `GET /api/patients/profile` - Get patient profile
- `PUT /api/patients/profile` - Update profile
- `GET /api/patients/medical-history` - Get medical history
- `PUT /api/patients/medical-history` - Update medical history
- `GET /api/patients/appointments` - Get appointments
- `GET /api/patients/prescriptions` - Get prescriptions

### Doctors
- `GET /api/doctors/profile` - Get doctor profile
- `GET /api/doctors/appointments/today` - Today's appointments
- `GET /api/doctors/patients/{id}` - Get patient record
- `GET /api/doctors/patients/search` - Search patients
- `POST /api/doctors/schedule` - Create schedule

### Appointments
- `GET /api/appointments/available-slots` - Get available slots
- `POST /api/appointments/book` - Book appointment
- `PUT /api/appointments/reschedule` - Reschedule appointment
- `PUT /api/appointments/cancel` - Cancel appointment

### Consultations
- `POST /api/consultations/start` - Start consultation
- `PUT /api/consultations/{id}` - Update consultation
- `PUT /api/consultations/{id}/end` - End consultation

### Prescriptions
- `POST /api/prescriptions` - Create prescription
- `POST /api/prescriptions/bulk` - Create multiple prescriptions
- `GET /api/prescriptions/{id}/pdf` - Generate PDF

### Medical Images
- `POST /api/medical-images/upload` - Upload image
- `GET /api/medical-images` - Get patient images
- `GET /api/medical-images/{id}/download` - Download image

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/{id}/read` - Mark as read

## Logs Location
Logs are stored in: `backend/logs/clinic-api-YYYYMMDD.txt`

## Database Migrations

### Create a new migration
```powershell
dotnet ef migrations add MigrationName
```

### Apply migrations
```powershell
dotnet ef database update
```

### Remove last migration
```powershell
dotnet ef migrations remove
```

## Troubleshooting

### Database Connection Issues
1. Verify SQL Server is running
2. Check connection string in appsettings.json
3. Ensure database user has proper permissions

### Migration Errors
1. Delete the `Migrations` folder
2. Delete the database
3. Run `dotnet ef migrations add InitialCreate` again
4. Run `dotnet ef database update`

### File Upload Issues
- Ensure `wwwroot/uploads/medical-images` directory exists
- Check file permissions
- Verify file size limits (default 10MB)

## Security Best Practices

### Production Deployment
1. Change JWT secret key to a strong random value
2. Use HTTPS only
3. Enable CORS only for specific origins
4. Use environment-specific appsettings
5. Store secrets in Azure Key Vault or similar
6. Enable rate limiting
7. Implement IP whitelisting if needed
8. Regular security audits
9. Keep packages up to date

### Environment Variables
For production, use environment variables:
```powershell
$env:ConnectionStrings__DefaultConnection="your-connection-string"
$env:JwtSettings__SecretKey="your-secret-key"
```
