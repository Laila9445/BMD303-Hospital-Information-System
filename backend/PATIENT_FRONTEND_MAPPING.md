# Patient Dashboard & Appointment Booking - Frontend API Mapping

## 🎯 PATIENT DASHBOARD OPERATIONS

### 1. Get Dashboard Statistics ✅ NEW
```
GET /api/patients/dashboard-stats
Authorization: Bearer {token}
```
**Frontend Implementation:**
```javascript
const getDashboardStats = async () => {
  const response = await api.get('/api/patients/dashboard-stats');
  return response.data;
};
```

**Response Format:**
```json
{
  "upcomingAppointments": 0,
  "totalVisits": 0,
  "activePrescriptions": 3,
  "recentAppointments": [],
  "recentPrescriptions": [
    {
      "prescriptionId": 1,
      "medicationName": "Ibuprofen",
      "dosage": "400mg",
      "frequency": "Twice daily",
      "duration": "7 days",
      "instructions": "Take with food",
      "prescribedDate": "2026-05-10T10:00:00",
      "endDate": "2026-05-17T10:00:00",
      "isActive": true,
      "doctorName": "Ahmed Nabil"
    }
  ]
}
```

### 2. Get Patient Profile ✅ EXISTING
```
GET /api/patients/profile
Authorization: Bearer {token}
```
**Frontend Implementation:**
```javascript
const getPatientProfile = async () => {
  const response = await api.get('/api/patients/profile');
  return response.data;
};
```

**Response Format:**
```json
{
  "patientId": 7,
  "firstName": "Fatma",
  "lastName": "Ahmed",
  "email": "Fatma@gmail.com",
  "phoneNumber": "01234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "Female",
  "address": "123 Main St, Cairo",
  "emergencyContactName": "Mohamed Ahmed",
  "emergencyContactPhone": "01234567891"
}
```

### 3. Book Appointment ✅ EXISTING
```
POST /api/appointments/book
Authorization: Bearer {token}
Content-Type: application/json
```
**Frontend Implementation:**
```javascript
const bookAppointment = async (appointmentData) => {
  const response = await api.post('/api/appointments/book', {
    doctorId: appointmentData.doctorId,
    timeSlotId: appointmentData.timeSlotId,
    reasonForVisit: appointmentData.reason
  });
  return response.data;
};
```

### 4. Get Available Time Slots ✅ EXISTING
```
GET /api/appointments/available-slots?doctorId={id}&startDate={date}&endDate={date}
Authorization: Bearer {token}
```
**Frontend Implementation:**
```javascript
const getAvailableSlots = async (doctorId, date) => {
  const response = await api.get('/api/appointments/available-slots', {
    params: {
      doctorId: doctorId,
      startDate: date.toISOString().split('T')[0],
      endDate: date.toISOString().split('T')[0]
    }
  });
  return response.data;
};
```

## 🔄 FRONTEND COMPONENT IMPLEMENTATION

### PatientDashboard.jsx
```jsx
import { useState, useEffect } from 'react';
import { getDashboardStats, getPatientProfile } from '../api/patients';

const PatientDashboard = () => {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, profileData] = await Promise.all([
        getDashboardStats(),
        getPatientProfile()
      ]);
      
      setStats(statsData);
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="patient-dashboard">
      <h2>Patient Dashboard</h2>
      
      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats?.upcomingAppointments || 0}</div>
          <div className="stat-label">Upcoming Appointments</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats?.totalVisits || 0}</div>
          <div className="stat-label">Total Visits</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats?.activePrescriptions || 0}</div>
          <div className="stat-label">Active Prescriptions</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="btn-primary" onClick={() => window.location.href = '/appointments'}>
            📅 Book Appointment
          </button>
          <button className="btn-success" onClick={() => window.location.href = '/medical-records'}>
            📋 Medical Records
          </button>
          <button className="btn-warning" onClick={() => window.location.href = '/prescriptions'}>
            💊 My Prescriptions
          </button>
        </div>
      </div>

      {/* Profile Information */}
      <div className="profile-info">
        <h3>Profile Information</h3>
        <div className="profile-content">
          <div className="user-avatar">👤</div>
          <h4>{profile?.firstName} {profile?.lastName}</h4>
          <p className="email">{profile?.email}</p>
          <p className="patient-id">Patient ID: #{profile?.patientId}</p>
          <button className="btn-secondary" onClick={() => window.location.href = '/profile'}>
            View Full Profile
          </button>
        </div>
      </div>
    </div>
  );
};
```

### BookAppointment.jsx
```jsx
import { useState, useEffect } from 'react';
import { getAvailableSlots, bookAppointment, getDoctors } from '../api/appointments';
import { getPatientProfile } from '../api/patients';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [patientProfile, setPatientProfile] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const loadInitialData = async () => {
    try {
      const [doctorsData, profileData] = await Promise.all([
        getDoctors(),
        getPatientProfile()
      ]);
      
      setDoctors(doctorsData);
      setPatientProfile(profileData);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedDoctor) return;
    
    setLoading(true);
    try {
      const data = await getAvailableSlots(selectedDoctor.doctorId, selectedDate);
      setAvailableSlots(data);
    } catch (error) {
      console.error('Failed to load available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (timeSlotId) => {
    if (!selectedDoctor || !selectedDate || !reason.trim()) {
      alert('Please fill all required fields');
      return;
    }

    try {
      await bookAppointment({
        doctorId: selectedDoctor.doctorId,
        timeSlotId: timeSlotId,
        reason: reason.trim()
      });
      
      alert('Appointment booked successfully!');
      // Reset form or redirect
      setSelectedDoctor(null);
      setReason('');
      setAvailableSlots([]);
    } catch (error) {
      console.error('Failed to book appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  const isDateValid = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  return (
    <div className="book-appointment">
      <h2>Book Appointment</h2>
      
      {/* Patient Info Display */}
      <div className="patient-info">
        <h3>Patient Information</h3>
        <p><strong>Name:</strong> {patientProfile?.firstName} {patientProfile?.lastName}</p>
        <p><strong>Patient ID:</strong> #{patientProfile?.patientId}</p>
      </div>

      {/* Doctor Selection */}
      <div className="form-group">
        <label>Select Doctor:</label>
        <select 
          value={selectedDoctor?.doctorId || ''} 
          onChange={(e) => setSelectedDoctor(doctors.find(d => d.doctorId == e.target.value))}
          className="form-control"
        >
          <option value="">Select a doctor</option>
          {doctors.map(doctor => (
            <option key={doctor.doctorId} value={doctor.doctorId}>
              Dr. {doctor.firstName} {doctor.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Date Selection */}
      <div className="form-group">
        <label>Appointment Date:</label>
        <input 
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          min={new Date().toISOString().split('T')[0]}
          className="form-control"
        />
        <small className="form-text">Only future dates and times can be selected.</small>
      </div>

      {/* Available Time Slots */}
      <div className="form-group">
        <label>Available Time Slots:</label>
        {loading ? (
          <p>Loading available slots...</p>
        ) : availableSlots.length === 0 ? (
          <p className="error-message">No time slots available for the selected date.</p>
        ) : (
          <div className="time-slots-grid">
            {availableSlots.map(slot => (
              <button 
                key={slot.timeSlotId} 
                className="time-slot"
                onClick={() => handleBookAppointment(slot.timeSlotId)}
              >
                {slot.startTime} - {slot.endTime}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reason for Visit */}
      <div className="form-group">
        <label>Reason for Visit:</label>
        <textarea 
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describe your symptoms or reason for appointment..."
          rows={4}
          className="form-control"
        />
      </div>

      <button 
        className="btn-primary" 
        onClick={() => availableSlots[0] && handleBookAppointment(availableSlots[0].timeSlotId)}
        disabled={!selectedDoctor || availableSlots.length === 0 || !reason.trim()}
      >
        Book Appointment
      </button>
    </div>
  );
};
```

## 🛡️ ERROR HANDLING

### Common Error Responses
```javascript
const handlePatientError = (error) => {
  if (error.response) {
    switch (error.response.status) {
      case 400:
        // Validation error
        alert(error.response.data.message || "Invalid request data");
        break;
      case 401:
        // Token expired
        localStorage.removeItem('token');
        window.location.href = '/login';
        break;
      case 404:
        // Resource not found
        alert("Requested resource not found");
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
  
  if (!data.doctorId) {
    errors.push("Please select a doctor");
  }
  
  if (!data.date || !isDateValid(data.date)) {
    errors.push("Please select a valid future date");
  }
  
  if (!data.timeSlotId) {
    errors.push("Please select a time slot");
  }
  
  if (!data.reason || data.reason.trim() === '') {
    errors.push("Please provide a reason for the visit");
  }
  
  if (data.reason && data.reason.length > 500) {
    errors.push("Reason cannot exceed 500 characters");
  }
  
  return errors;
};
```

## 🎯 COMPLETE API OPERATIONS

| Operation | Method | Endpoint | Auth Required | Role | Status |
|-----------|--------|----------|---------------|---------|---------|
| Get Dashboard Stats | GET | `/api/patients/dashboard-stats` | Yes | Patient | ✅ Added |
| Get Profile | GET | `/api/patients/profile` | Yes | Patient | ✅ Existing |
| Get Appointments | GET | `/api/patients/appointments` | Yes | Patient | ✅ Existing |
| Book Appointment | POST | `/api/appointments/book` | Yes | Patient | ✅ Existing |
| Get Available Slots | GET | `/api/appointments/available-slots` | Yes | All | ✅ Existing |
| Get Prescriptions | GET | `/api/patients/prescriptions` | Yes | Patient | ✅ Existing |
| Get Medical Records | GET | `/api/patients/medical-history` | Yes | Patient | ✅ Existing |

## 🚀 READY FOR NEXT SCREENS

The backend now supports all Patient Dashboard operations:
- ✅ Dashboard statistics display
- ✅ Patient profile information
- ✅ Appointment booking with doctor selection
- ✅ Available time slot checking
- ✅ Proper error handling
- ✅ Date validation (future dates only)
- ✅ Quick actions navigation

**Ready for remaining Patient screens!**
