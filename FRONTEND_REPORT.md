# Orthopedic Clinic System - Frontend Technical Report

## Overview
This document provides a comprehensive technical analysis of the frontend clinic management system for backend integration purposes.

---

## 1. Routes & Components

### Public Routes
- `/` → `Home` - Landing page
- `/services` → `Services` - Clinic services overview
- `/about` → `About` - About clinic
- `/patients` → `PatientsInfo` - Patient information
- `/contact` → `Contact` - Contact page
- `/login` → `Login` - Authentication page
- `/register` → `Register` - User registration

### Doctor Routes (Protected - requireDoctor)
- `/doctor/dashboard` → `DoctorDashboard` + `DoctorLayout`
- `/doctor/appointments` → `Appointments` + `DoctorLayout`
- `/doctor/patients` → `Patients` + `DoctorLayout`
- `/doctor/patients/:patientId` → `PatientDetails` + `DoctorLayout`
- `/doctor/schedule` → `Schedule` + `DoctorLayout`
- `/doctor/profile` → `Profile` + `DoctorLayout`
- `/doctor/consultations` → `Consultations` + `DoctorLayout`
- `/doctor/imaging` → `Imaging` + `DoctorLayout`
- `/doctor/referrals` → `Referrals` + `DoctorLayout`
- `/doctor/prescriptions` → `DoctorPrescriptions` + `DoctorLayout`

### Patient Routes (Protected - requirePatient)
- `/patient/dashboard` → `PatientDashboard` + `PatientLayout`
- `/patient/appointments` → `PatientAppointments` + `PatientLayout`
- `/patient/medical-records` → `PatientMedicalRecords` + `PatientLayout`
- `/patient/profile` → `PatientProfile` + `PatientLayout`
- `/patient/prescriptions` → `PatientPrescriptions` + `PatientLayout`

### Nurse Routes (Protected - requireNurse)
- `/nurse/dashboard` → `NurseDashboard` + `NurseLayout`
- `/nurse/appointments` → `NurseAppointments` + `NurseLayout`
- `/nurse/patients` → `NursePatients` + `NurseLayout`
- `/nurse/schedule` → `NurseSchedule` + `NurseLayout`
- `/nurse/profile` → `NurseProfile` + `NurseLayout`

### Physiotherapy Routes
- `/physio/dashboard` → `PhysioDashboard` + `DoctorLayout`
- `/physio` → `PhysioPortalShell`
  - `/physio/services` → `PhysioServicesPage`
  - `/physio/booking` → `PhysioBookingPage`
  - `/physio/success` → `PhysioSuccessPage`
  - `/physio/contact` → `PhysioContactPage` + `PhysioLayout`
  - `/physio/panel` → `PhysioAppDashboard` + `PhysioLayout`
  - `/physio/staff` → `PhysioStaffDashboard` + `PhysioLayout`
  - `/physio/patients` → `PhysioPatientsPage` + `PhysioLayout`
  - `/physio/patients/:patientId` → `PhysioPatientDetail` + `PhysioLayout`
  - `/physio/appointments` → `PhysioAppointmentsPage`
  - `/physio/treatment-plans` → `PhysioTreatmentPlansPage` + `PhysioLayout`

### Radiology Routes
- `/radiology/login` → `RadiologyOsLogin`
- `/radiology/panel` → `RadiologyOsDashboard`
- `/radiology/patients` → `RadiologyPatients`
- `/radiology/studies` → `RadiologyStudies`
- `/radiology/reports` → `RadiologyReports`
- `/radiology/billing` → `RadiologyPlaceholder` (Billing)
- `/radiology/staff` → `RadiologyStaffDashboard` + `RadiologyLayout`
- `/radiology/services` → `RadiologyServicesPage`
- `/radiology/booking` → `RadiologyBookingPage`
- `/radiology/success` → `RadiologySuccessPage`
- `/radiology/appointments` → `RadiologyAppointmentsPage`
- `/radiology/dashboard` → `RadiologyDashboard` + `RadiologyLayout`

### Utility Routes
- `/unauthorized` → Unauthorized access page
- `/dashboard` → `DashboardRedirect` (role-based redirect)
- `*` → Redirect to `/`

---

## 2. API Calls Documentation

### Authentication Service (`authService.js`)
**Note**: Currently configured to use localStorage only (API calls removed)

### Appointment Service (`appointmentService.js`)
- `GET /api/Appointments/available-slots` - Get available time slots
  - Params: `doctorId`, `startDate`, `endDate`
- `POST /api/Appointments/book` - Book appointment
  - Body: appointment data object
- `PUT /api/Appointments/reschedule` - Reschedule appointment
  - Body: `appointmentId`, `newTimeSlotId`
- `PUT /api/Appointments/cancel` - Cancel appointment
  - Body: `appointmentId`, `cancellationReason`
- `GET /api/Appointments/my-appointments` - Get patient appointments
- `GET /api/Appointments/doctor-appointments` - Get doctor appointments
- `POST /api/Appointments/create` - Create appointment (admin/doctor)
  - Body: appointment data object
- `GET /api/Appointments/{appointmentId}` - Get appointment details

### Consultation Service (`consultationService.js`)
- `POST /api/Consultations/start` - Start consultation
  - Body: `appointmentId`
- `PUT /api/Consultations/{consultationId}` - Update consultation
  - Body: consultation data object
- `PUT /api/Consultations/{consultationId}/end` - End consultation
- `GET /api/Consultations/{consultationId}` - Get consultation details
- `GET /api/Consultations/patient/history` - Get patient consultation history
- `GET /api/Consultations/doctor/patient-history/{patientId}` - Get doctor's patient history

### Doctor Service (`doctorService.js`)
- `GET /api/Doctors` - Get all doctors
- `GET /api/Doctors/profile` - Get doctor profile
- `PUT /api/Doctors/profile` - Update doctor profile
  - Body: profile data object
- `GET /api/Doctors/appointments/today` - Get today's appointments
- `GET /api/Doctors/appointments` - Get appointments for date
  - Params: `date`
- `GET /api/Doctors/patients/search` - Search patients
  - Params: `query`
- `GET /api/Doctors/patients/{patientId}` - Get patient record
- `GET /api/Doctors/patients/{patientId}/images` - Get patient medical images
- `POST /api/Doctors/schedule` - Create schedule
  - Body: schedule data object
- `GET /api/Doctors/schedule` - Get doctor schedules
- `DELETE /api/Doctors/schedule/{scheduleId}` - Delete schedule

### Medical Image Service (`medicalImageService.js`)
- `POST /api/MedicalImages/upload` - Upload medical image
  - Body: FormData with `File`, `ImageType`, `Description`
- `GET /api/MedicalImages` - Get all medical images
- `GET /api/MedicalImages/{imageId}/download` - Download medical image
- `DELETE /api/MedicalImages/{imageId}` - Delete medical image

### Notification Service (`notificationService.js`)
- `GET /api/Notifications` - Get user notifications
- `PUT /api/Notifications/{notificationId}/read` - Mark as read
- `DELETE /api/Notifications/{notificationId}` - Delete notification
- `POST /api/Notifications/appointment-reminder/{appointmentId}` - Send reminder

### Patient Service (`patientService.js`)
- `GET /api/Patients` - Get all patients
- `GET /api/Patients/profile` - Get patient profile
- `PUT /api/Patients/profile` - Update patient profile
  - Body: profile data object
- `GET /api/Patients/medical-history` - Get medical history
- `PUT /api/Patients/medical-history` - Update medical history
  - Body: medical history data object
- `GET /api/Patients/appointments` - Get patient appointments
- `GET /api/Patients/prescriptions` - Get patient prescriptions
- `GET /api/Patients/medical-images` - Get patient medical images
- `POST /api/Patients/medical-images/upload` - Upload medical image
  - Body: FormData with `file`, `description`
- `GET /api/Consultations/patient/history` - Get consultation history
- `GET /api/Patients/dashboard-stats` - Get dashboard stats

### Prescription Service (`prescriptionService.js`)
- `POST /api/Prescriptions` - Create prescription
  - Body: prescription data object
- `POST /api/Prescriptions/bulk` - Create bulk prescriptions
  - Body: array of prescription objects
- `GET /api/Prescriptions/my-prescriptions` - Get patient prescriptions
- `GET /api/Prescriptions/doctor/{doctorId}` - Get doctor prescriptions
- `GET /api/Prescriptions/{prescriptionId}` - Get prescription details
- `GET /api/Prescriptions/{prescriptionId}/pdf` - Generate prescription PDF
- `POST /api/Prescriptions/{prescriptionId}/send` - Send to patient

### Referral Service (`referralService.js`)
- `POST /api/Referrals` - Create referral
  - Body: referral data object
- `GET /api/Referrals/doctor/{doctorId}` - Get doctor referrals
  - Params: `status` (optional)
- `GET /api/Referrals/patient/{patientExternalId}` - Get patient referrals
- `GET /api/Referrals/{referralId}` - Get referral details
- `PUT /api/Referrals/{referralId}/status` - Update referral status
  - Body: `status`
- `POST /api/Referrals/{referralId}/send` - Send to external system

---

## 3. LocalStorage Keys & Usage

### Authentication Keys
- `token` - Authentication token (string)
  - **Written by**: authService.login, authService.register
  - **Read by**: AuthContext, apiClient
- `user` - Current user object (JSON)
  - **Written by**: authService.login, authService.register
  - **Read by**: AuthContext, multiple components
- `clinic_users` - All registered users (JSON array)
  - **Written by**: authService.register, authService.clearAllUsers
  - **Read by**: authService.login, authService.register
- `clinic_current_user` - Current user session (JSON)
  - **Written by**: authService.login, authService.register
  - **Read by**: authService.logout

### Referral System Keys
- `referrals` - All referrals data (JSON array)
  - **Written by**: ReferralContext.addReferral, ReferralContext.updateReferralStatus
  - **Read by**: ReferralContext, RadiologyStaffDashboard, PhysioStaffDashboard

### Physiotherapy Keys
- `physio_token` - Physiotherapy authentication token
  - **Written by**: PhysioAuthService.login
  - **Read by**: PhysioAuthService
- `physio_appointments` - Physiotherapy appointments (JSON array)
  - **Written by**: PhysioAppointmentService
  - **Read by**: PhysioAppointmentService
- `physio_patients` - Physiotherapy patients (JSON array)
  - **Written by**: PhysioPatientService
  - **Read by**: PhysioPatientService
- `physio_treatment_plans` - Treatment plans (JSON array)
  - **Written by**: PhysioTreatmentService
  - **Read by**: PhysioTreatmentService

### Radiology Keys
- `radiology_appointments` - Radiology appointments (JSON array)
  - **Written by**: RadiologyAppointmentService
  - **Read by**: RadiologyAppointmentService
- `radiology_studies` - Radiology studies (JSON array)
  - **Written by**: RadiologyStudyService
  - **Read by**: RadiologyStudyService
- `radiology_reports` - Radiology reports (JSON array)
  - **Written by**: RadiologyReportService
  - **Read by**: RadiologyReportService

---

## 4. Context Providers

### AuthContext (`src/context/AuthContext.jsx`)
**Provider**: `AuthProvider`
**Data Provided**:
- `user` - Current user object
- `loading` - Authentication loading state
- `isAuthenticated` - Boolean authentication status
- `login(email, password)` - Login function
- `register(userData)` - Register function
- `logout()` - Logout function
- `isDoctor` - Boolean: user.role === 'Doctor'
- `isPatient` - Boolean: user.role === 'Patient'
- `isNurse` - Boolean: user.role === 'Nurse'
- `isPhysio` - Boolean: user.role === 'Physiotherapist'
- `isRadiology` - Boolean: user.role === 'Radiologist'

### ReferralContext (`src/context/ReferralContext.jsx`)
**Provider**: `ReferralProvider`
**Data Provided**:
- `referrals` - Array of referral objects
- `addReferral(referral)` - Add new referral
- `updateReferralStatus(id, status)` - Update referral status

### PhysioAuthContext (`src/pages/physio/contexts/PhysioAuthContext.jsx`)
**Provider**: `PhysioAuthProvider`
**Data Provided**:
- `currentUser` - Current physiotherapy user
- `loading` - Authentication loading state
- `isAuthenticated` - Boolean authentication status
- `login(email, password)` - Login function
- `logout()` - Logout function

---

## 5. User Roles & Access Permissions

### Doctor
**Layout**: `DoctorLayout`
**Accessible Pages**:
- Dashboard, Appointments, Patients, Patient Details
- Schedule, Profile, Consultations, Imaging
- Referrals, Prescriptions

### Patient
**Layout**: `PatientLayout`
**Accessible Pages**:
- Dashboard, Appointments, Medical Records
- Profile, Prescriptions

### Nurse
**Layout**: `NurseLayout`
**Accessible Pages**:
- Dashboard, Appointments, Patients
- Schedule, Profile

### Physiotherapist
**Layout**: `PhysioLayout` (for staff pages)
**Accessible Pages**:
- `/physio/staff` - Staff Dashboard
- `/physio/patients` - Patient management
- `/physio/appointments` - Appointments
- `/physio/treatment-plans` - Treatment plans
- Public physiotherapy portal pages

### Radiologist
**Layout**: `RadiologyLayout` (for staff pages)
**Accessible Pages**:
- `/radiology/staff` - Staff Dashboard
- `/radiology/dashboard` - Main dashboard
- `/radiology/patients` - Patient management
- `/radiology/studies` - Medical studies
- `/radiology/reports` - Reports
- `/radiology/appointments` - Appointments
- Public radiology portal pages

---

## 6. Data Flow Between User Types

### Doctor → Patient Flow
1. **Doctor creates appointment** → Patient receives notification
2. **Doctor conducts consultation** → Medical record updated
3. **Doctor prescribes medication** → Patient can view prescriptions
4. **Doctor creates referral** → Referral appears in respective department

### Doctor → Physiotherapist Flow
1. **Doctor creates physiotherapy referral** → Referral stored in localStorage
2. **Physiotherapist accepts referral** → Status updated to 'Accepted'
3. **Physiotherapist creates treatment plan** → Patient can view in portal
4. **Physiotherapist schedules sessions** → Patient receives appointments

### Doctor → Radiologist Flow
1. **Doctor creates radiology referral** → Referral stored in localStorage
2. **Radiologist accepts referral** → Status updated to 'Accepted'
3. **Radiologist schedules imaging** → Patient receives appointment
4. **Radiologist creates report** → Patient can view results

### Patient Access Flow
1. **Patient books appointment** → Appears in doctor's schedule
2. **Patient views medical records** → Data from consultations
3. **Patient views prescriptions** → Data from doctor prescriptions
4. **Patient accesses referral results** → From physio/radiology departments

### Cross-Department Communication
- **Referral System**: Central hub for inter-department communication
- **Event System**: `referrals-updated` events sync data across components
- **Status Tracking**: Pending → Accepted → Completed workflow

---

## 7. Forms & Fields Documentation

### Login Form (`src/pages/auth/Login.jsx`)
**Fields**:
- `email` (email) - User email address
- `password` (password) - User password

### Register Form (`src/pages/auth/Register.jsx`)
**Fields**:
- `firstName` (text) - First name (required)
- `lastName` (text) - Last name (required)
- `email` (email) - Email address (required)
- `phoneNumber` (tel) - Phone number (required)
- `role` (select) - User role: Doctor/Patient/Nurse/Physiotherapist/Radiologist (required)
- `password` (password) - Password (required, min 8 chars)
- `confirmPassword` (password) - Confirm password (required)
- `gender` (select) - Gender: Male/Female (optional)
- `dateOfBirth` (date) - Date of birth (optional)

### Referral Modal (`src/components/medical/ReferralModal.jsx`)
**Fields**:
- `patientId` (text) - Patient ID (required, auto-filled if provided)
- `referralType` (select) - Type of referral (required)
  - Radiology: X-Ray, CT, MRI, Ultrasound, Mammography, DEXA, Angiography, Fluoroscopy
  - Physiotherapy: Orthopedic, Neurological, Cardiopulmonary, Sports, Pediatric, Geriatric, etc.
- `urgency` (select) - Urgency level: Routine/Urgent/Emergency (required)
- `reason` (text) - Reason for referral (required, max 1000 chars)
- `notes` (text) - Additional notes (optional, max 1000 chars)

### Book Appointment Modal (`src/components/medical/BookAppointmentModal.jsx`)
**Patient Selection**:
- Search existing patients by ID/name/email
- OR register new patient:
  - `firstName` (text) - First name (required)
  - `lastName` (text) - Last name (required)
  - `email` (email) - Email address (required)
  - `phoneNumber` (tel) - Phone number
  - `gender` (select) - Gender: Male/Female
  - `dateOfBirth` (date) - Date of birth

**Appointment Details**:
- `doctorId` (select) - Doctor selection (auto-selected)
- `appointmentDate` (date) - Appointment date (required, future dates only)
- `timeSlotId` (select) - Available time slot (required)
- `reasonForVisit` (text) - Reason for visit (required)

### Patient Profile Forms
**Basic Information**:
- `firstName`, `lastName`, `email`, `phoneNumber`
- `gender`, `dateOfBirth`, `address`

**Medical Information**:
- `medicalHistory` - Medical conditions, allergies, medications
- `emergencyContact` - Emergency contact information

### Doctor/Nurse Profile Forms
**Professional Information**:
- `firstName`, `lastName`, `email`, `phoneNumber`
- `specialization`, `licenseNumber`, `experience`
- `education`, `certifications`

---

## 8. Technical Implementation Details

### State Management
- **React Context**: AuthContext, ReferralContext, PhysioAuthContext
- **Local Storage**: Primary data persistence
- **Event System**: Custom events for cross-component communication

### Authentication Flow
1. User logs in via authService (localStorage only)
2. AuthContext updates user state
3. ProtectedRoute checks role-based access
4. User redirected to appropriate dashboard

### Data Persistence
- **Primary**: localStorage for all user data, appointments, referrals
- **Fallback**: Mock data in mockDatabase.js
- **Sync**: Custom events for real-time updates across tabs

### Error Handling
- **Toast Notifications**: react-hot-toast for user feedback
- **Validation**: utils/validation.js for form validation
- **Error Boundaries**: ErrorBoundary component for error catching

### Styling
- **CSS-in-JS**: styled-components for component styling
- **Responsive**: Mobile-first design approach
- **Theme**: Consistent color scheme and typography

---

## 9. Backend Integration Requirements

### API Endpoints Needed
All endpoints listed in Section 2 need to be implemented with matching:
- HTTP methods (GET, POST, PUT, DELETE)
- Request/response data structures
- Error handling and status codes
- Authentication middleware

### Database Schema Considerations
- **Users Table**: Support all user roles with role-based permissions
- **Appointments Table**: Link patients, doctors, time slots
- **Referrals Table**: Track inter-department referrals and status
- **Medical Records**: Patient history, consultations, prescriptions
- **Scheduling System**: Time slots, availability, conflicts

### Authentication System
- JWT token-based authentication
- Role-based access control (RBAC)
- Session management
- Password hashing and validation

### Real-time Features
- WebSocket connections for live updates
- Event broadcasting for appointment/referral updates
- Notification system for user alerts

---

## 10. Default Test Users

The system initializes with these default users (password: "123"):

1. **Doctor**: `doctor@clinic.com` - Ahmed Nabil
2. **Nurse**: `nurse@clinic.com` - Sara Mohamed  
3. **Patient**: `patient@clinic.com` - Mohamed Ali

These users are automatically created in localStorage on application load for testing purposes.

---

## 11. Component Architecture & Design System

### Component Hierarchy
```
App.jsx
├── AuthProvider
├── ReferralProvider  
├── Router
    ├── Public Routes
    │   ├── Home, Services, About, Contact
    │   ├── Login, Register
    │   └── Physio/Radiology Public Pages
    └── Protected Routes
        ├── DoctorLayout
        │   ├── Sidebar (navigation)
        │   └── Main Content Area
        ├── PatientLayout
        │   ├── PatientSidebar
        │   └── Main Content Area
        ├── NurseLayout
        │   ├── NurseSidebar
        │   └── Main Content Area
        ├── PhysioLayout
        │   ├── PhysioSidebar
        │   └── Main Content Area
        └── RadiologyLayout
            ├── RadiologySidebar
            └── Main Content Area
```

### Common UI Components (`src/components/common/`)

#### Button Component
**Props**:
- `variant`: 'primary' | 'success' | 'danger' | 'warning' | 'secondary'
- `size`: 'small' | 'medium' | 'large'
- `disabled`: boolean
- `minWidth`: string
- `children`: ReactNode

**Styling**: Styled-components with hover effects, transitions, and responsive design

#### Card Component
**Exports**: `Card`, `CardHeader`, `CardBody`, `CardFooter`
**Props**:
- `size`: 'small' | 'medium' | 'large' (affects padding)
- `align`: flex alignment for CardFooter

**Features**: Hover animations, responsive shadows, consistent spacing

#### Input Components (`Input.jsx`)
**Exports**: `InputWithLabel`, `SelectWithLabel`, `TextAreaWithLabel`
**Props**:
- `label`: string
- `type`: HTML input type
- `placeholder`: string
- `error`: string (validation error)
- `required`: boolean
- `disabled`: boolean

**Features**: Integrated error display, consistent styling, accessibility support

#### Layout Components
- `Sidebar.jsx`: Navigation with role-based menu items
- `Navbar.jsx`: Top navigation bar
- `ProtectedRoute.jsx`: Authentication wrapper
- `ErrorBoundary.jsx`: Error catching component

### Medical Components (`src/components/medical/`)
- `BookAppointmentModal.jsx`: Complex appointment booking with patient search
- `ReferralModal.jsx`: Inter-department referral creation

### Specialized Components
- `PhysioLayout.jsx`: Physiotherapy-specific layout
- `RadiologyLayout.jsx`: Radiology-specific layout
- `HelpButton.jsx`: Contextual help system

---

## 12. Validation Rules & Error Handling

### Comprehensive Validation System (`src/utils/validation.js`)

#### User Registration Validation
```javascript
// Email: Required, valid format, max 100 chars
email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Password: Required, min 8 chars, complexity rules
password: {
  minLength: 8,
  maxLength: 100,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSpecial: true
}

// Phone: Egyptian format validation
phone: /^(\+20|0)?1[0125]\d{8}$/

// Name: Letters and spaces only, 2-50 chars
name: /^[a-zA-Z\s]+$/
```

#### Appointment Validation
- **Date**: Must be future date
- **Time Slot**: Valid slot ID, not in past
- **Doctor ID**: Positive integer
- **Reason**: Max 500 characters

#### Medical Data Validation
- **Consultation Fields**: Max 2000 characters
- **Prescription**: Name (2-200 chars), Dosage (2-100 chars)
- **Medical Images**: JPEG/PNG/GIF/BMP/WebP/TIFF, max 10MB
- **Referral**: Reason/Notes max 1000 chars

### Error Handling Strategy
1. **Frontend Validation**: Immediate feedback
2. **API Error Handling**: 
   ```javascript
   try {
     await apiCall();
   } catch (error) {
     const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   'Default error message';
     toast.error(message);
   }
   ```
3. **Toast Notifications**: User-friendly error messages
4. **Form Error Display**: Field-specific validation errors

---

## 13. State Management Patterns

### Context-Based Architecture
```javascript
// AuthContext Pattern
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const login = async (email, password) => {
    // Authentication logic
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Local Storage Synchronization
```javascript
// Event-driven updates
window.dispatchEvent(new Event('referrals-updated'));

// Cross-tab synchronization
useEffect(() => {
  const onStorageChange = (e) => {
    if (e.key === 'referrals') {
      setReferrals(JSON.parse(e.newValue));
    }
  };
  window.addEventListener('storage', onStorageChange);
  return () => window.removeEventListener('storage', onStorageChange);
}, []);
```

### Component State Patterns
```javascript
// Form state with validation
const [formData, setFormData] = useState({
  email: '',
  password: ''
});
const [errors, setErrors] = useState({});

// Optimistic updates
const handleUpdate = async (newData) => {
  // Update UI immediately
  setLocalData(prev => ({ ...prev, ...newData }));
  try {
    await api.update(newData);
  } catch (error) {
    // Rollback on error
    setLocalData(originalData);
  }
};
```

---

## 14. Performance Optimization

### Code Splitting
```javascript
// Lazy loading routes
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'));

// Dynamic imports for large components
const ReferralModal = lazy(() => import('./components/medical/ReferralModal'));
```

### Memoization Strategies
```javascript
// Expensive computations
const filteredPatients = useMemo(() => {
  return patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [patients, searchTerm]);

// Event handlers
const handleSubmit = useCallback(async (data) => {
  // Submit logic
}, [dependencies]);
```

### Bundle Optimization
- **Vite Configuration**: Tree shaking, code splitting
- **Dynamic Imports**: Route-based code splitting
- **Asset Optimization**: Image compression, lazy loading

### Performance Monitoring
```javascript
// Component performance tracking
const [renderTime, setRenderTime] = useState(0);

useEffect(() => {
  const start = performance.now();
  return () => {
    const end = performance.now();
    setRenderTime(end - start);
  };
});
```

---

## 15. Security Considerations

### Client-Side Security
```javascript
// XSS Prevention
const sanitizeInput = (input) => {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

// Data Validation
const validateInput = (input, rules) => {
  // Server-side validation rules mirrored on client
};

// Secure Storage
const secureStorage = {
  set: (key, value) => {
    // Encrypt sensitive data before storage
    const encrypted = btoa(JSON.stringify(value));
    localStorage.setItem(key, encrypted);
  },
  get: (key) => {
    // Decrypt on retrieval
    const encrypted = localStorage.getItem(key);
    return encrypted ? JSON.parse(atob(encrypted)) : null;
  }
};
```

### Authentication Security
- **Token Management**: Secure storage, automatic refresh
- **Session Management**: Timeout handling, secure logout
- **CSRF Protection**: Token-based requests

### Data Protection
- **Input Sanitization**: All user inputs sanitized
- **Output Encoding**: Prevent XSS in rendered content
- **HTTPS Enforcement**: Production-only secure connections

---

## 16. Build & Deployment Configuration

### Vite Configuration (`vite.config.js`)
```javascript
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['styled-components', '@heroicons/react']
        }
      }
    },
    sourcemap: true,
    minify: 'terser'
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
```

### Package Dependencies
```json
{
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-router-dom": "^7.13.1",
    "styled-components": "^6.3.11",
    "axios": "^1.13.6",
    "react-hot-toast": "^2.6.0",
    "@heroicons/react": "^2.2.0",
    "lucide-react": "^0.468.0",
    "recharts": "^2.15.4",
    "date-fns": "^4.1.0"
  }
}
```

### Build Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```

### Environment Configuration
```javascript
// .env.example
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Orthopedic Clinic
VITE_ENABLE_MOCK_DATA=true

// Production
VITE_API_BASE_URL=https://api.clinic.com/api
VITE_APP_NAME=Orthopedic Clinic
VITE_ENABLE_MOCK_DATA=false
```

---

## 17. Testing Strategy

### Component Testing
```javascript
// Example test setup
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';

const TestWrapper = ({ children }) => (
  <AuthProvider>
    {children}
  </AuthProvider>
);

test('Login form submission', async () => {
  render(<Login />, { wrapper: TestWrapper });
  
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'test@example.com' }
  });
  
  fireEvent.click(screen.getByText('Sign In'));
  
  expect(await screen.findByText('Login successful')).toBeInTheDocument();
});
```

### Integration Testing
- **API Integration**: Mock API responses
- **Route Integration**: Test protected routes
- **Context Integration**: Test state management

### E2E Testing Strategy
```javascript
// Cypress example
describe('Appointment Booking Flow', () => {
  it('should book appointment successfully', () => {
    cy.login('doctor@clinic.com', '123');
    cy.visit('/doctor/appointments');
    cy.get('[data-testid="book-appointment"]').click();
    // Fill form and submit
    cy.get('[data-testid="submit"]').click();
    cy.get('[data-testid="success-message"]').should('be.visible');
  });
});
```

### Debugging Tools
```javascript
// Development debugging
if (import.meta.env.DEV) {
  window.DEBUG_CLINIC = {
    auth: true,
    api: true,
    state: true
  };
}

// Error boundary logging
class ErrorBoundary extends Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error tracking service
  }
}
```

---

## 18. Enhanced API Documentation with Examples

### Authentication Endpoints

#### Register User
```http
POST /api/Auth/register
Content-Type: application/json

{
  "firstName": "Ahmed",
  "lastName": "Nabil", 
  "email": "doctor@clinic.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "phoneNumber": "01234567890",
  "role": "Doctor",
  "gender": "Male",
  "dateOfBirth": "1980-01-01"
}

Response 201:
{
  "success": true,
  "message": "Registration successful!",
  "user": {
    "userId": 1,
    "firstName": "Ahmed",
    "lastName": "Nabil",
    "email": "doctor@clinic.com",
    "role": "Doctor",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login User
```http
POST /api/Auth/login
Content-Type: application/json

{
  "email": "doctor@clinic.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "success": true,
  "message": "Login successful",
  "user": {
    "userId": 1,
    "firstName": "Ahmed",
    "lastName": "Nabil",
    "email": "doctor@clinic.com",
    "role": "Doctor"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Appointment Management

#### Get Available Slots
```http
GET /api/Appointments/available-slots?doctorId=1&startDate=2024-01-01&endDate=2024-01-07
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": [
    {
      "timeSlotId": 1,
      "slotDate": "2024-01-02",
      "startTime": "09:00:00",
      "endTime": "09:30:00",
      "status": "Available"
    },
    {
      "timeSlotId": 2,
      "slotDate": "2024-01-02", 
      "startTime": "09:30:00",
      "endTime": "10:00:00",
      "status": "Booked"
    }
  ]
}
```

#### Book Appointment
```http
POST /api/Appointments/book
Content-Type: application/json
Authorization: Bearer {token}

{
  "doctorId": 1,
  "patientId": 123,
  "appointmentDate": "2024-01-02",
  "timeSlotId": 1,
  "reasonForVisit": "Regular checkup",
  "status": "Scheduled"
}

Response 201:
{
  "success": true,
  "message": "Appointment booked successfully!",
  "data": {
    "appointmentId": 456,
    "doctorId": 1,
    "patientId": 123,
    "appointmentDate": "2024-01-02T09:00:00Z",
    "status": "Scheduled"
  }
}
```

### Referral System

#### Create Referral
```http
POST /api/Referrals
Content-Type: application/json
Authorization: Bearer {token}

{
  "patientId": 123,
  "referralType": "radiology-xray",
  "reason": "Chest pain investigation",
  "urgency": "routine",
  "notes": "Patient reports chest discomfort",
  "doctorId": 1,
  "doctorName": "Ahmed Nabil",
  "createdDate": "2024-01-01T10:00:00Z",
  "status": "Pending"
}

Response 201:
{
  "success": true,
  "message": "Referral created successfully!",
  "data": {
    "referralId": 789,
    "patientId": 123,
    "type": "Radiology",
    "status": "Pending",
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

#### Update Referral Status
```http
PUT /api/Referrals/789/status
Content-Type: application/json
Authorization: Bearer {token}

{
  "status": "Accepted"
}

Response 200:
{
  "success": true,
  "message": "Referral status updated successfully",
  "data": {
    "referralId": 789,
    "status": "Accepted",
    "updatedAt": "2024-01-01T11:00:00Z"
  }
}
```

---

## 19. Real-time Features Implementation

### WebSocket Integration
```javascript
// WebSocket service
class WebSocketService {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.authenticate();
    };
  }
  
  handleMessage(data) {
    switch(data.type) {
      case 'APPOINTMENT_UPDATE':
        window.dispatchEvent(new CustomEvent('appointment-updated', { detail: data }));
        break;
      case 'REFERRAL_UPDATE':
        window.dispatchEvent(new CustomEvent('referral-updated', { detail: data }));
        break;
    }
  }
  
  authenticate() {
    const token = localStorage.getItem('token');
    this.ws.send(JSON.stringify({
      type: 'AUTH',
      token
    }));
  }
}
```

### Event-Driven Updates
```javascript
// Custom event system for real-time updates
const ClinicEvents = {
  APPOINTMENT_CREATED: 'appointment-created',
  REFERRAL_UPDATED: 'referral-updated',
  USER_LOGGED_IN: 'user-logged-in',
  USER_LOGGED_OUT: 'user-logged-out'
};

// Usage in components
useEffect(() => {
  const handleReferralUpdate = (event) => {
    const referral = event.detail;
    setReferrals(prev => 
      prev.map(r => r.id === referral.id ? referral : r)
    );
  };
  
  window.addEventListener(ClinicEvents.REFERRAL_UPDATED, handleReferralUpdate);
  return () => window.removeEventListener(ClinicEvents.REFERRAL_UPDATED, handleReferralUpdate);
}, []);
```

---

## 20. Mobile Responsiveness & Accessibility

### Responsive Breakpoints
```javascript
// Styled-components responsive design
const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  large: '1440px'
};

const mediaQueries = {
  mobile: `@media (max-width: ${breakpoints.mobile})`,
  tablet: `@media (max-width: ${breakpoints.tablet})`,
  desktop: `@media (min-width: ${breakpoints.desktop})`
};
```

### Accessibility Features
```javascript
// ARIA support
const AccessibleButton = styled.button`
  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }
  
  // Screen reader support
  &[aria-disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Keyboard navigation
useEffect(() => {
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [onClose]);
```

---

## 21. Internationalization Support

### i18n Configuration
```javascript
// Language configuration
const languages = {
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      loading: 'Loading...'
    },
    auth: {
      login: 'Login',
      register: 'Register',
      logout: 'Logout'
    }
  },
  ar: {
    common: {
      save: 'حفظ',
      cancel: 'إلغاء',
      loading: 'جاري التحميل...'
    },
    auth: {
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      logout: 'تسجيل الخروج'
    }
  }
};
```

### RTL Support
```javascript
// RTL styling for Arabic
const StyledContainer = styled.div`
  direction: ${({ isRTL }) => isRTL ? 'rtl' : 'ltr'};
  text-align: ${({ isRTL }) => isRTL ? 'right' : 'left'};
  
  @media ${mediaQueries.mobile} {
    padding: ${({ isRTL }) => isRTL ? '16px 8px 16px 16px' : '16px 16px 16px 8px'};
  }
`;
```

---

## 22. Monitoring & Analytics

### Performance Monitoring
```javascript
// Performance tracking
const trackPerformance = (metricName, value) => {
  if (import.meta.env.PROD) {
    // Send to monitoring service
    gtag('event', metricName, {
      value: value,
      custom_parameter: 'clinic_frontend'
    });
  }
};

// Component render tracking
const usePerformanceTracking = (componentName) => {
  useEffect(() => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      trackPerformance(`${componentName}_render_time`, endTime - startTime);
    };
  });
};
```

### User Analytics
```javascript
// User behavior tracking
const trackUserAction = (action, properties) => {
  if (import.meta.env.PROD) {
    window.dataLayer.push({
      event: action,
      ...properties,
      user_role: currentUser?.role,
      timestamp: new Date().toISOString()
    });
  }
};

// Usage examples
trackUserAction('appointment_booked', {
  doctor_id: doctorId,
  appointment_date: appointmentDate
});
```

---

**Generated**: May 12, 2026  
**System**: Orthopedic Clinic Management Frontend  
**Framework**: React + Vite + Styled-Components  
**Enhanced**: Comprehensive technical documentation with implementation details
