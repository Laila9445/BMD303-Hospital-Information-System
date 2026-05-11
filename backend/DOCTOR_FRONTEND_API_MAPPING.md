# Doctor Frontend API Mapping - Complete Integration Guide

## 🎯 DOCTOR APPOINTMENT MANAGEMENT OPERATIONS

### 1. Get Doctor Profile (Already Working)
```
GET /api/auth/profile
Authorization: Bearer {token}
```
**Response:**
```json
{
  "userId": 1,
  "email": "ahmed.nabil@clinic.com",
  "name": "Ahmed Nabil",
  "role": "Doctor"
}
```

### 2. Get Doctor Appointments by Date ✅ NEW
```
GET /api/appointments/doctor-appointments?date=2026-05-11
Authorization: Bearer {token}
```
**Frontend Implementation:**
```javascript
const getDoctorAppointments = async (date) => {
  const response = await api.get('/api/appointments/doctor-appointments', {
    params: { 
      date: date.toISOString().split('T')[0] // Format: YYYY-MM-DD
    }
  });
  return response.data; // Returns AppointmentDTO[]
};
```

**Response:**
```json
[
  {
    "appointmentId": 1,
    "doctorName": "Ahmed Nabil",
    "patientName": "Sarah Mohamed",
    "appointmentDate": "2026-05-11T10:30:00",
    "startTime": "10:30",
    "endTime": "11:00",
    "status": "Scheduled",
    "reasonForVisit": "Follow-up consultation"
  }
]
```

### 3. Create New Appointment ✅ NEW
```
POST /api/appointments/create
Authorization: Bearer {token}
Content-Type: application/json
```
**Frontend Implementation:**
```javascript
const createAppointment = async (appointmentData) => {
  const response = await api.post('/api/appointments/create', {
    patientId: appointmentData.patientId,
    appointmentDate: appointmentData.date.toISOString(),
    timeSlotId: appointmentData.timeSlotId,
    reasonForVisit: appointmentData.reason || "",
    status: "Scheduled"
  });
  return response.data;
};
```

**Request Body:**
```json
{
  "patientId": 5,
  "appointmentDate": "2026-05-11T14:00:00",
  "timeSlotId": 12,
  "reasonForVisit": "Initial consultation",
  "status": "Scheduled"
}
```

## 🔄 FRONTEND WORKFLOW IMPLEMENTATION

### Component: AppointmentManagement.jsx
```jsx
import { useState, useEffect } from 'react';
import { getDoctorAppointments, createAppointment } from '../api/appointments';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Load appointments when date changes
  useEffect(() => {
    loadAppointments();
  }, [selectedDate]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await getDoctorAppointments(selectedDate);
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSearch = () => {
    loadAppointments();
  };

  const handleAddAppointment = async (appointmentData) => {
    try {
      await createAppointment(appointmentData);
      loadAppointments(); // Refresh the list
    } catch (error) {
      console.error('Failed to create appointment:', error);
    }
  };

  return (
    <div>
      <h2>Appointment Management</h2>
      <p>View and manage patient appointments</p>
      
      <button onClick={() => setShowAddModal(true)}>
        + Add Appointment
      </button>

      <div>
        <h3>Your Appointments for {selectedDate.toLocaleDateString()}</h3>
        <input 
          type="date" 
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
        />
        <button onClick={handleDateSearch}>Search</button>
      </div>

      {loading ? (
        <p>Loading appointments...</p>
      ) : appointments.length === 0 ? (
        <p>No appointments on this date</p>
      ) : (
        <ul>
          {appointments.map(apt => (
            <li key={apt.appointmentId}>
              {apt.patientName} - {apt.startTime} to {apt.endTime}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

## 🛡️ ERROR HANDLING

### Common Error Responses
```javascript
const handleApiError = (error) => {
  if (error.response) {
    switch (error.response.status) {
      case 400:
        // Validation error or slot unavailable
        alert(error.response.data.error || "Invalid request");
        break;
      case 401:
        // Token expired - redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        break;
      case 403:
        // Not authorized for this operation
        alert("You don't have permission for this action");
        break;
      case 404:
        // Resource not found
        alert("Appointment not found");
        break;
      case 500:
        // Server error
        alert("Server error. Please try again later.");
        break;
    }
  }
};
```

## 📋 VALIDATION RULES

### Frontend Validation
```javascript
const validateAppointmentData = (data) => {
  const errors = [];
  
  if (!data.patientId || data.patientId <= 0) {
    errors.push("Please select a valid patient");
  }
  
  if (!data.appointmentDate) {
    errors.push("Appointment date is required");
  }
  
  if (!data.timeSlotId || data.timeSlotId <= 0) {
    errors.push("Please select a valid time slot");
  }
  
  if (data.reasonForVisit && data.reasonForVisit.length > 500) {
    errors.push("Reason for visit must be less than 500 characters");
  }
  
  return errors;
};
```

## 🔄 DATE HANDLING

### Consistent Date Formatting
```javascript
// For API requests
const formatDateForApi = (date) => {
  return date.toISOString(); // 2026-05-11T10:30:00.000Z
};

// For display
const formatDateForDisplay = (dateString) => {
  return new Date(dateString).toLocaleDateString(); // 5/11/2026
};

// For date input
const formatDateForInput = (date) => {
  return date.toISOString().split('T')[0]; // 2026-05-11
};
```

## 🎯 COMPLETE API CALLS SUMMARY

| Operation | Method | Endpoint | Auth Required | Role |
|-----------|--------|----------|---------------|------|
| Get Profile | GET | `/api/auth/profile` | Yes | Doctor |
| Get Appointments | GET | `/api/appointments/doctor-appointments` | Yes | Doctor |
| Create Appointment | POST | `/api/appointments/create` | Yes | Doctor |
| Get Available Slots | GET | `/api/appointments/available-slots` | Yes | Doctor/Patient |
| Get Appointment Details | GET | `/api/appointments/{id}` | Yes | All |
| Cancel Appointment | PUT | `/api/appointments/cancel` | Yes | Doctor/Patient |

## 🚀 READY FOR NEXT SCREENS

The backend now supports all operations shown in the Doctor Appointment Management screen:
- ✅ Profile display
- ✅ Date-based appointment filtering
- ✅ Appointment creation
- ✅ Proper error handling
- ✅ Authentication and authorization

**Ready for remaining Doctor screens!**
