 ##  Hospital Information System
> A centralized, web-based hospital management system that connects every department (doctors, nurses, patients, radiologists, physiotherapists and billing) through one secure platform.
**Course project:** BMD303 – Biomedical Information Systems · School of Computer Science & Biomedical Informatics, Nile University

---
##  Overview
The system replaces disconnected, paper-based hospital workflows with a single platform. Each staff member and patient signs in and lands on a dashboard built for their role. Clinical actions such as referrals, prescriptions and appointments are reflected across departments and in the patient's own profile.
##  Features
### Clinical
- **Appointment management**: booking, scheduling and per-role calendars
- **Referral workflows**: doctors create and track referrals to radiology and physiotherapy; receiving staff accept or reject them
- **Medical records**: patients see a read-only health summary updated by their care team
- **Prescriptions**: created by doctors and visible to patients
- **Imaging**: doctors can upload imaging results
### Administrative
- **Billing & invoices**: services appear on the patient's profile and become payable once completed
- **Role-based access control (RBAC)**
- **Schedule management**
- **Authentication & security**
##  Roles & Dashboards
| Role | Dashboard capabilities |
|---|---|
| **Doctor** | View patient records, track consultations, manage appointments and schedules, create and track referrals, upload imaging, write prescriptions |
| **Patient** | View appointments, prescriptions, medical records, referrals and billing; pay invoices once a service is completed |
| **Nurse** | Nurse dashboard for day-to-day patient care workflows |
| **Radiologist** | Staff queue of radiology referrals: accept or reject cases and schedule appointments |
| **Physiotherapist** | Receive referrals, accept cases, create treatment plans and schedule therapy sessions |
| **Billing staff** | Manage invoices and payments |
##  Security
- JWT token-based authentication
- Protected routes on the client and role-based authorization on the API
- Session persistence using `localStorage`
- Every user is redirected to their own dashboard after login
  
##  Example Workflow: Referral → Appointment → Billing
1. A **doctor** creates a referral (e.g. radiology CT scan or physiotherapy).
2. The referral appears in the **patient's profile** and in the receiving department's queue.
3. The **radiologist / physiotherapist** accepts it and schedules a session (the patient picks a treatment, date and time, then finalizes the booking).
4. When the service is completed, the **patient can pay** the invoice.
##  API
The API is documented with Swagger/OpenAPI and has two groups of endpoints.
### Referral endpoints (`/api/Referrals`)
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/Referrals` | Create a referral |
| GET | `/api/Referrals/{id}` | Get a referral |
| GET | `/api/Referrals/doctor/{doctorId}` | Referrals by doctor |
| GET | `/api/Referrals/my-referrals` | Current user's referrals |
| GET | `/api/Referrals/patient/{patientExternalId}` | Referrals by patient |
| PUT | `/api/Referrals/{id}/status` | Update referral status |
| POST | `/api/Referrals/{id}/send` | Send referral |
| GET | `/api/Referrals/{id}/appointment` | Appointment linked to a referral |
| GET | `/api/Referrals/stats` | Referral statistics |
### FHIR endpoints (`/fhir`)
Read-only, interoperability-oriented resources:
`metadata` · `Patient` · `Practitioner` · `Condition` · `CarePlan` · `ServiceRequest` · `Appointment` · `Observation` (including `Observation/encounter/{encounterId}`)
##  Tech Stack
- **Backend:** .NET (ASP.NET Core Web API), JWT authentication, role-based authorization, Swagger/OpenAPI
- **Interoperability:** FHIR-style resource endpoints
- **Frontend:** web application with protected routes and role-based dashboards
