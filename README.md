# BMD303 – Hospital Information System

Backend API for the physiotherapy clinic module of a hospital information system (HIS), built with **FastAPI**, **async SQLAlchemy** and **PostgreSQL**. It manages patients, referrals, appointments and therapist session notes, with JWT authentication and role-based access control.

## Features
- **Authentication**: JWT access tokens and refresh tokens (login, refresh, logout, current profile).
- **Role-based access**: `admin`, `therapist` and `nurse` roles. Session notes are therapist-only, and seeding and staff listing are admin-only.
- **Patients**: create, list, update, view a patient summary and list a patient's referrals.
- **Referrals**: create, list, view and update, with statuses `pending`, `scheduled`, `completed` and `cancelled`.
- **Appointments**: create, list, view, update and a "today" view, with statuses `scheduled`, `completed`, `cancelled` and `no_show`.
- **Session notes**: assessment, treatment, home exercises, pain score before and after, and next appointment date.
- **Services catalogue**: the clinic services that appointments are booked against.
- **Database migrations** with Alembic, plus a `create_tables.py` shortcut and a seed script.
- **Consistent JSON errors** (`not_found`, `conflict`, `validation_error`, `server_error`).
- **Postman collections** for each development phase.
## Tech stack
| Layer | Technology |
|-------|-----------|
| Framework | FastAPI, Uvicorn |
| Database | PostgreSQL via `asyncpg` |
| ORM and migrations | SQLAlchemy 2 (async), Alembic |
| Validation and settings | Pydantic, pydantic-settings, email-validator |
| Security | passlib (bcrypt), python-jose (JWT) |
## Project structure
```
.
├── main.py                  # FastAPI app, middleware, routers, error handlers, admin endpoints
├── database.py              # Async engine, session factory, Base
├── core/
│   ├── config.py            # Settings loaded from .env
│   └── security.py          # Password hashing and JWT helpers
├── models/                  # SQLAlchemy models (patient, referral, appointment, session_note, service, staff, refresh_token)
├── schemas/                 # Pydantic schemas (auth, clinic)
├── routers/                 # auth, patients, referrals, appointments, sessions, services, dependencies
├── data/                    # seed.py, seed_db.py
├── alembic/                 # Migration environment and versions
├── create_tables.py         # Create tables without Alembic
├── build_phase8_postman.py  # Generates the Phase 8 Postman collection
└── PhysioClinic_Phase*.postman_collection.json
```
## Getting started
| Role | Email |
|------|-------|
| Admin | `admin@clinic.com` |
| Therapist | `ahmed.hassan@clinic.com` |
| Nurse | `mona.ibrahim@clinic.com` |
The seed passwords are defined in `data/seed_db.py`. Change them before any real deployment.
## API overview
All routes are under `/api` and need a `Bearer` token, except login and refresh.
| Area | Endpoints | Access |
|------|-----------|--------|
| Auth | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` | Public (login, refresh); authenticated (logout, me) |
| Patients | `POST /patients`, `GET /patients`, `GET /patients/{id}`, `PATCH /patients/{id}`, `GET /patients/{id}/summary`, `GET /patients/{id}/referrals` | Active staff |
| Referrals | `POST /referrals`, `GET /referrals`, `GET /referrals/{id}`, `PATCH /referrals/{id}` | Active staff |
| Appointments | `POST /appointments`, `GET /appointments`, `GET /appointments/today`, `GET /appointments/{id}`, `PATCH /appointments/{id}` | Active staff |
| Session notes | `POST /sessions`, `GET /sessions`, `GET /sessions/{id}`, `GET /sessions/patient/{patient_id}` | Therapist only |
| Services | `GET /services`, `GET /services/{id}` | Active staff |
| Admin (no `/api` prefix) | `POST /admin/seed`, `GET /admin/staff` | Admin only |
### Error format
```json
{ "error": "not_found", "detail": "Patient not found" }
```
Error codes: `not_found` (404), `conflict` (409), `validation_error` (422), `server_error` (500).
## Data model
`Staff` · `Patient` · `Service` · `Referral` · `Appointment` · `SessionNote` · `RefreshToken`
- A patient has many referrals, appointments and session notes.
- A session note belongs to a patient and a therapist (`staff`). The therapist link is set to null if the staff member is deleted.
## Testing with Postman
Import the `PhysioClinic_Phase*.postman_collection.json` files into Postman. Log in first to get a token, then run the requests.
