# ?? BILLING BACKEND - QUICK START GUIDE

## ? 30-Second Setup (Do This First!)

```bash
# 1. Navigate to project
cd "C:\Users\Best By\OneDrive - Nile University\Desktop\Billing_Backend"

# 2. Run the application
dotnet run

# 3. Open in browser
https://localhost:7001/swagger
```

**Done!** Application is now running ?

---

## ?? Complete Setup (If Needed)

### Prerequisites Check
```bash
# Verify .NET 8.0 installed
dotnet --version

# Should show: 8.0.x or higher
```

### Step 1: Restore Dependencies (First Time Only)
```bash
dotnet restore
```

### Step 2: Build
```bash
dotnet build
```

### Step 3: Setup HTTPS Certificate (If Needed)
```bash
# Generate certificate
dotnet dev-certs https

# Trust certificate
dotnet dev-certs https --trust
```

### Step 4: Run Application
```bash
dotnet run
```

---

## ? Verify Application is Running

### Check 1: Swagger UI
```
https://localhost:7001/swagger
```
**Expected**: Swagger page loads with all endpoints

### Check 2: Health Endpoint
```bash
curl https://localhost:7001/api/health/status -k
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "Billing Backend",
  "version": "1.0.0"
}
```

### Check 3: Application Logs
Look for:
```
[INF] Now listening on: https://localhost:7001
[INF] Application started. Press Ctrl+C to shut down.
```

---

## ?? Quick API Test

### Test 1: Create Invoice (No Auth Required)
```bash
curl -X POST https://localhost:7001/api/billing/events \
  -H "Content-Type: application/json" \
  -k \
  -d '{
    "patientId": 1,
    "serviceName": "Consultation",
    "price": 200.00,
    "idempotencyKey": "invoice-1"
  }'
```

### Test 2: Get Health Info
```bash
curl https://localhost:7001/api/health/info -k
```

### Test 3: Use Swagger UI
1. Open https://localhost:7001/swagger
2. Click "Try it out" on any endpoint
3. Fill in parameters
4. Click "Execute"

---

## ?? Stop Application

```bash
# In the terminal running the app, press:
Ctrl + C
```

---

## ?? Troubleshooting

### Issue: "Unable to configure HTTPS endpoint"
**Solution:**
```bash
dotnet dev-certs https --clean
dotnet dev-certs https
dotnet dev-certs https --trust
```

### Issue: "Database not found"
**Solution:**
- Verify LocalDB is running: `sqllocaldb start mssqllocaldb`
- Check connection string in `appsettings.json`

### Issue: "Port already in use"
**Solution:**
- Edit `Properties/launchSettings.json`
- Change port 7001 and 5001 to available ports

### Issue: "Service resolution failed"
**Solution:**
```bash
dotnet clean
dotnet build
dotnet run
```

---

## ?? Important Files

| File | Purpose |
|------|---------|
| `Billing_Backend.csproj` | Project configuration |
| `Program.cs` | Application startup |
| `appsettings.json` | Production settings |
| `appsettings.Development.json` | Dev settings |
| `Controllers/BillingController.cs` | API endpoints |

---

## ?? Available Endpoints

### No Authentication Required
```
POST   /api/billing/events          Create invoice
GET    /api/health/status           Health check
GET    /api/health/info             App info
```

### Requires Authentication (Add JWT Token)
```
GET    /api/billing/{id}            Get invoice
GET    /api/billing/patient/{id}    Get patient invoices
POST   /api/billing/payments        Process payment
GET    /api/billing/summary/patient/{id}  Patient summary
```

---

## ?? Useful URLs

| Purpose | URL |
|---------|-----|
| **API Swagger** | https://localhost:7001/swagger |
| **Health Check** | https://localhost:7001/api/health/status |
| **App Info** | https://localhost:7001/api/health/info |
| **HTTPS API** | https://localhost:7001/api/billing |
| **HTTP API** | http://localhost:5001/api/billing |

---

## ?? Common Commands

```bash
# Build project
dotnet build

# Run application
dotnet run

# Run in Release mode
dotnet run --configuration Release

# Create migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update

# View migrations
dotnet ef migrations list

# Remove last migration
dotnet ef migrations remove

# Clean build
dotnet clean

# Restore packages
dotnet restore
```

---

## ?? Documentation

- **README.md** - Full documentation
- **SETUP_AND_DEPLOYMENT.md** - Detailed setup
- **BILLING_API_TESTING.md** - API examples
- **ISSUES_RESOLVED.md** - What was fixed

---

## ?? Get Help

1. Check `ISSUES_RESOLVED.md` for known issues
2. Review application logs (check terminal output)
3. Read `README.md` for detailed documentation
4. Check `BILLING_SYSTEM_GUIDE.md` for API documentation

---

## ? You're Ready!

```
Application is running ?
Endpoints are available ?
Database is connected ?
API is ready to use ?

Start testing now!
```

Open https://localhost:7001/swagger and try an endpoint! ??

---

**Version**: 1.0  
**Status**: ? Running  
**Last Updated**: 2026-04-24
