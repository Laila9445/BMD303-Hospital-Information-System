# Radiology Backend - Fix Validation Guide

This guide walks through validating all the fixes that were applied to the project.

## ✅ Step 1: Verify Configuration Fixes

### 1a. Check SECRET_KEY & ENCRYPTION_KEY Configuration
```powershell
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Run Python to verify config loads correctly
python -c "from core.config import settings; print(f'SECRET_KEY loaded: {len(settings.SECRET_KEY) > 0}'); print(f'ENCRYPTION_KEY loaded: {len(settings.ENCRYPTION_KEY) > 0}'); print(f'DATABASE_URL: {settings.DATABASE_URL}')"
```

**Expected Output:**
```
SECRET_KEY loaded: True
ENCRYPTION_KEY loaded: True
DATABASE_URL: postgresql://radiology_user:strongpassword@localhost:5432/radiology_db
```

### 1b. Verify ALLOWED_ORIGINS Configured
```powershell
python -c "from core.config import settings; print(f'ALLOWED_ORIGINS: {settings.ALLOWED_ORIGINS}')"
```

---

## ✅ Step 2: Database Setup & Migrations

### 2a. Ensure PostgreSQL is Running
```powershell
# Test connection
psql -U radiology_user -d radiology_db -h localhost -W

# If connected, you'll see:
# Password: <enter password>
# radiology_db=> 

# Exit
\q
```

### 2b. Generate Initial Migration
```powershell
# Go to project root (should already be there)
cd c:\Users\nada4\Downloads\Radiology_backend

# Activate venv
.\.venv\Scripts\Activate.ps1

# Generate migration from models
alembic revision --autogenerate -m "Initial schema with all models"
```

**Expected Output:**
```
  Generating c:\Users\nada4\Downloads\Radiology_backend\alembic\versions\<revision_id>_initial_schema_with_all_models.py
  ...
```

### 2c. Review the Generated Migration
```powershell
# Open the file that was just created
# Verify it includes:
# - users table
# - patients table
# - studies table
# - reports table
# - medical_images table
# - audit_logs table
```

### 2d. Apply Migration to Database
```powershell
# Run the migration
alembic upgrade head

# Expected output:
# INFO [alembic.runtime.migration] Context impl PostgresqlImpl.
# INFO [alembic.runtime.migration] Will assume transactional DDL.
# INFO [alembic.runtime.migration] Running upgrade -> <revision_id>, initial_schema...
```

### 2e. Verify Tables Created
```powershell
# Connect to database
psql -U radiology_user -d radiology_db -h localhost

# List tables
\dt

# Should show: users, patients, studies, reports, medical_images, audit_logs
# Exit
\q
```

---

## ✅ Step 3: Application Startup Test

### 3a. Start the FastAPI Server
```powershell
# Make sure you're in project root and venv is activated
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

**If you see errors:**
- Database initialization error → Check PostgreSQL is running
- Import errors → Run: `pip install -r requirements.txt`
- Missing module → Check Python version (3.9+)

### 3b. Health Check
```powershell
# In a new PowerShell window:
curl http://localhost:8000

# Expected:
# {"status":"success","data":"Welcome to Radiology Center API v2.0"}
```

---

## ✅ Step 4: API Endpoint Testing

### 4a. Test User Registration
```powershell
# Using curl (or Postman)
$body = @{
    username = "testuser"
    email = "test@example.com"
    password = "TestPassword123!"
    full_name = "Test User"
    role = "user"
} | ConvertTo-Json

curl -X POST http://localhost:8000/api/auth/register `
  -H "Content-Type: application/json" `
  -d $body

# Expected: 201 Created with user data and success message
```

### 4b. Test User Login
```powershell
$body = @{
    username = "testuser"
    password = "TestPassword123!"
} | ConvertTo-Json

curl -X POST http://localhost:8000/api/auth/login `
  -H "Content-Type: application/json" `
  -d $body

# Expected: Returns access_token and refresh_token
# Save the access_token for next tests
```

### 4c. Test Token Persistence
This is the most important test for the SECRET_KEY fix:

```powershell
# 1. Get a token (see step 4b)
# 2. Keep the token value: $token = "eyJhb..."
# 3. Stop the server (Ctrl+C)
# 4. Restart the server
# 5. Try using the old token

curl -X GET http://localhost:8000/api/patients `
  -H "Authorization: Bearer $token"

# BEFORE FIX: Would get 401 Unauthorized
# AFTER FIX: Should work correctly - token still valid
```

### 4d. Test CORS Configuration
```powershell
# Test that CORS respects allowed origins
curl -X OPTIONS http://localhost:8000/api/patients `
  -H "Origin: http://localhost:3000" `
  -H "Access-Control-Request-Method: GET"

# Should see CORS headers in response
# Try with unauthorized origin: http://attacker.com
# Should still respond but may not have CORS headers
```

---

## ✅ Step 5: Error Handling & Transaction Tests

### 5a. Test Database Error Handling
```powershell
# Stop PostgreSQL temporarily
# Try to call an endpoint:
curl -X GET http://localhost:8000/api/patients `
  -H "Authorization: Bearer $token"

# Expected: 503 Service Unavailable with proper error message
# NOT: Internal server error or crash
```

### 5b. Test Transaction Rollback
```powershell
# Create a patient with invalid data to trigger rollback
$body = @{
    name = "Test Patient"
    age = -5  # Invalid age - should trigger validation
} | ConvertTo-Json

curl -X POST http://localhost:8000/api/patients `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d $body

# Server should not crash, proper error response
```

---

## ✅ Step 6: Run Unit Tests

```powershell
# Activate venv
.\.venv\Scripts\Activate.ps1

# Run pytest on all tests
pytest tests/ -v

# Run specific test file
pytest tests/test_auth.py -v

# Run with coverage
pytest tests/ --cov=routers --cov=core
```

**Expected:** All tests should pass

---

## ✅ Step 7: Code Validation

```powershell
# Check for deprecated datetime usage
grep -r "utcnow()" . --include="*.py" 

# Should return: No matches (all fixed)

# Check for SECRET_KEY hardcoding
grep -r "secrets.token_urlsafe" . --include="*.py"

# Should show: Only in this guide, not in actual code

# Verify imports
python -c "from core.security import create_access_token; print('Imports OK')"
```

---

## 🔧 Troubleshooting

### PostgreSQL Connection Issues
```powershell
# Check if PostgreSQL is running
# Windows: Services.msc → Look for PostgreSQL service
# Or: pg_isready -h localhost -p 5432

# If not running, start it:
# net start postgresql-x64-14  (adjust version number)
```

### Alembic Migration Issues
```powershell
# If migration doesn't run:
alembic current  # Check current version

# Rollback and retry:
alembic downgrade -1
alembic upgrade head

# Clear alembic version info:
# DELETE FROM alembic_version; (in database)
# Then run: alembic upgrade head
```

### Permission Errors
```powershell
# Check file permissions in encrypted_images/
Get-ChildItem encrypted_images/ -Force

# Fix if needed:
icacls encrypted_images /grant Everyone:F /t
```

---

## ✅ Final Checklist

- [ ] SECRET_KEY persists across restarts
- [ ] ENCRYPTION_KEY persists across restarts
- [ ] Database migrations run without errors
- [ ] All tables created successfully
- [ ] App starts without database errors
- [ ] Health check endpoint works
- [ ] User registration works
- [ ] User login returns tokens
- [ ] Tokens remain valid after app restart
- [ ] CORS headers present for allowed origins
- [ ] Database errors handled gracefully
- [ ] All tests pass
- [ ] Rate limiting active on endpoints
- [ ] Transaction rollback on errors
- [ ] No deprecated datetime.utcnow() calls

---

## 📋 Next Steps

If everything passes:
1. Push changes to git
2. Deploy to staging environment
3. Run integration tests
4. Deploy to production with database backups
5. Monitor logs for any issues

