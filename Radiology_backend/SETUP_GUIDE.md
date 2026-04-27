# Complete Setup Guide - Radiology Backend with PostgreSQL

## Step 1: PostgreSQL Installation & Database Setup

### Windows Setup

#### 1a. Verify PostgreSQL Installation
```powershell
# Check if PostgreSQL is installed
psql --version

# If not installed, download from: https://www.postgresql.org/download/windows/
# During installation, remember:
# - Default port: 5432
# - Superuser: postgres
# - Password: (you set this during installation)
```

#### 1b. Create Database and User via PowerShell
```powershell
# Open PowerShell and connect to PostgreSQL (using postgres user)
psql -U postgres

# Once in psql (you'll see postgres=#), execute these commands:
```

**Inside PostgreSQL CLI (psql):**
```sql
-- Create the radiology user
CREATE USER radiology_user WITH PASSWORD 'strongpassword';

-- Create the database
CREATE DATABASE radiology_db OWNER radiology_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE radiology_db TO radiology_user;

-- Connect to the database and set additional privileges
\c radiology_db

GRANT ALL PRIVILEGES ON SCHEMA public TO radiology_user;

-- Verify setup
\du  -- List users
\l   -- List databases

-- Exit psql
\q
```

---

## Step 2: Test Database Connection

```powershell
# From your project directory, test the connection
psql -U radiology_user -d radiology_db -h localhost -W

# When prompted, enter password: strongpassword
# If successful, you'll see: radiology_db=>
# Type \q to exit
```

---

## Step 3: Project Setup

```powershell
# Navigate to your project directory
cd c:\Users\nada4\Downloads\Radiology_backend

# Activate virtual environment (already done based on context)
.\.venv\Scripts\Activate.ps1

# Install/verify dependencies
pip install -r requirements.txt

# Create database tables via Alembic migrations
alembic upgrade head

# If no migrations exist yet, create them
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

---

## Step 4: Start the FastAPI Server

```powershell
# From project directory with venv activated
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

---

## Step 5: Access & Test with Swagger

### Access Swagger UI
Open in your browser:
- **Swagger UI:** http://localhost:8000/docs
- **Alternative (ReDoc):** http://localhost:8000/redoc
- **OpenAPI JSON:** http://localhost:8000/openapi.json

### Testing Workflow

1. **Health Check** (First test):
   - In Swagger, find any endpoint and execute it
   - Or use a simple endpoint like `/` if available

2. **Authentication Test**:
   - Find the `POST /auth/register` endpoint
   - Click "Try it out"
   - Enter test user data:
   ```json
   {
     "email": "test@example.com",
     "password": "TestPassword123!",
     "full_name": "Test User"
   }
   ```
   - Click "Execute"
   - Copy the returned `access_token`

3. **Authorize in Swagger**:
   - Click the "Authorize" button (top right)
   - Select "Bearer Token" scheme
   - Paste your `access_token` in the value field
   - Click "Authorize"

4. **Test Protected Endpoints**:
   - Now test patient, study, report, and image endpoints
   - All requests will include your token automatically

---

## Step 6: Running Tests

```powershell
# From project directory with venv activated

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_auth.py -v

# Run with coverage
pytest --cov=. --cov-report=html
```

---

## Troubleshooting Connection Issues

### Issue: "FATAL: password authentication failed"
```powershell
# Verify password in .env
cat .env | Select-String DATABASE_URL

# Verify user exists in PostgreSQL
psql -U postgres -c "\du"

# Reset user password
psql -U postgres -c "ALTER USER radiology_user WITH PASSWORD 'strongpassword';"
```

### Issue: "FATAL: database does not exist"
```powershell
# Create database as shown in Step 1b
# Verify:
psql -U postgres -l  # List all databases
```

### Issue: "connection refused on 127.0.0.1:5432"
```powershell
# PostgreSQL service might not be running
# Check Windows Services:
Get-Service postgresql-x64-*  # Check if service exists

# Or use PostgreSQL Tools
# Windows Services -> Find "postgres" -> Start it
```

### Issue: Port 5432 already in use
```powershell
# Find process using port 5432
netstat -ano | findstr :5432

# Kill the process (if needed)
taskkill /PID <PID> /F
```

---

## Quick Reference Commands

| Command | Purpose |
|---------|---------|
| `psql -U radiology_user -d radiology_db` | Connect to database |
| `alembic upgrade head` | Run all pending migrations |
| `alembic current` | Show current database schema version |
| `uvicorn main:app --reload` | Start dev server |
| `pytest -v` | Run all tests |
| `pytest tests/test_auth.py::test_register` | Run specific test |

---

## Environment Variables (.env)
```
DATABASE_URL=postgresql://radiology_user:strongpassword@localhost:5432/radiology_db
SECRET_KEY=TiRPF9y6rHQW2q5IIYfpZ3PE5XP0OOZUxgAMSH4gfsg
ENCRYPTION_KEY=Z7Ma81gXmrf_n5OX1jufVNeuQdArDZLNxuVORl_vGts=
```

---

## Next Steps After Setup
1. ✅ Create test user via `/auth/register` endpoint
2. ✅ Test patient management endpoints
3. ✅ Test image upload/download functionality
4. ✅ Test report generation
5. ✅ Run full test suite

## API Base URL
- Development: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`
