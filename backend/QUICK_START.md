# Clinic System API - Simplified Quick Start Guide

## ✅ Setup Complete!

Your Clinic System API has been simplified for easy local development. No SQL Server needed!

## **To Run the API:**

```powershell
cd "c:\Users\Best By\OneDrive - Nile University\Desktop\Clinic(hospital sys)\backend"
dotnet run -c Debug --project CLINICSYSTEM.csproj --no-build --no-launch-profile
```

## **What Changed:**

1. ✅ **Switched to SQLite** - No database installation required, runs locally
2. ✅ **Removed heavy dependencies** - Disabled email, PDF, Redis, RabbitMQ, etc.
3. ✅ **Minimal configuration** - Auto-creates database on first run
4. ✅ **Fast startup** - Reduced logging verbosity
5. ✅ **Development-friendly** - HTTPS disabled, automatic migrations

## **URLs:**

- **API Base**: `http://localhost:5000`
- **Swagger UI**: `http://localhost:5000/swagger`
- **Database**: `clinic_dev.db` (created automatically)

## **First Run:**

When you run it for the first time, it will:
- Create the SQLite database
- Run migrations automatically
- Seed default roles (Doctor, Admin, Staff)

## **Quick API Test:**

```powershell
# In a new terminal
Invoke-WebRequest -Uri "http://localhost:5000/swagger" | Select-Object StatusCode
```

## **Available Endpoints:**

- Authentication: `/api/auth/login`, `/api/auth/register`
- Doctors: `/api/doctors`
- Appointments: `/api/appointments`
- Consultations: `/api/consultations`  
- Prescriptions: `/api/prescriptions`
- And more... (see Swagger UI)

## **Stop the Server:**

Press `Ctrl+C` in the terminal

---

**That's it!** Your integrated system is now much simpler to develop and test locally.
