# Doctor Medical Referrals - Frontend API Mapping

## 🎯 DOCTOR REFERRALS OPERATIONS

### 1. Get Doctor's Referrals ✅ NEW
```
GET /api/referrals/my-referrals
Authorization: Bearer {token}
```
**Frontend Implementation:**
```javascript
const getMyReferrals = async (status = null) => {
  const response = await api.get('/api/referrals/my-referrals', {
    params: { status }
  });
  return response.data; // Returns ReferralDTO[]
};
```

**Response Format:**
```json
[
  {
    "referralId": 1,
    "patientExternalId": "P12345",
    "doctorId": 1,
    "doctorName": "Ahmed Nabil",
    "referralType": "Radiology",
    "reason": "Persistent knee pain",
    "diagnosis": "Knee osteoarthritis",
    "priority": "Normal",
    "status": "Pending",
    "createdAt": "2026-05-10T23:45:00",
    "sentAt": null,
    "acceptedAt": null,
    "completedAt": null
  }
]
```

### 2. Create New Referral ✅ EXISTING
```
POST /api/referrals
Authorization: Bearer {token}
Content-Type: application/json
```
**Frontend Implementation:**
```javascript
const createReferral = async (referralData) => {
  const response = await api.post('/api/referrals', {
    patientExternalId: referralData.patientId,
    doctorId: referralData.doctorId, // Will be set by backend
    referralType: referralData.referralType,
    reason: referralData.reason,
    diagnosis: referralData.diagnosis || "",
    priority: referralData.priority, // Use "Normal" not "Routine"
    autoSend: true
  });
  return response.data;
};
```

**Request Body:**
```json
{
  "patientExternalId": "P12345",
  "referralType": "Radiology",
  "reason": "Persistent knee pain",
  "diagnosis": "Knee osteoarthritis",
  "priority": "Normal",
  "autoSend": true
}
```

### 3. Update Referral Status ✅ EXISTING
```
PUT /api/referrals/{id}/status
Authorization: Bearer {token}
```
**Frontend Implementation:**
```javascript
const updateReferralStatus = async (referralId, status, feedback = null) => {
  const response = await api.put(`/api/referrals/${referralId}/status`, {
    status: status,
    feedback: feedback
  });
  return response.data;
};
```

## 🔄 FRONTEND COMPONENT IMPLEMENTATION

### ReferralManagement.jsx
```jsx
import { useState, useEffect } from 'react';
import { getMyReferrals, createReferral, updateReferralStatus } from '../api/referrals';

const ReferralManagement = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    setLoading(true);
    try {
      const data = await getMyReferrals();
      setReferrals(data);
    } catch (error) {
      console.error('Failed to load referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReferral = async (referralData) => {
    try {
      await createReferral(referralData);
      loadReferrals(); // Refresh list
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to create referral:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'orange';
      case 'Sent': return 'blue';
      case 'Accepted': return 'green';
      case 'InProgress': return 'yellow';
      case 'Completed': return 'green';
      case 'Cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'gray';
      case 'Normal': return 'blue'; // "Routine" in frontend maps to "Normal"
      case 'High': return 'orange';
      case 'Urgent': return 'red';
      default: return 'gray';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <h2>Medical Referrals</h2>
      <p>Manage patient referrals to other departments</p>
      
      <button onClick={() => setShowAddModal(true)}>
        + Add Referral
      </button>

      <div>
        <h3>Referral List ({referrals.length})</h3>
        
        {loading ? (
          <p>Loading referrals...</p>
        ) : referrals.length === 0 ? (
          <p>No referrals found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Referral Type</th>
                <th>Reason</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Created Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map(referral => (
                <tr key={referral.referralId}>
                  <td>{referral.patientExternalId || 'N/A'}</td>
                  <td>{referral.referralType}</td>
                  <td>{referral.reason}</td>
                  <td>
                    <span 
                      style={{ 
                        backgroundColor: getPriorityColor(referral.priority),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    >
                      {referral.priority === 'Normal' ? 'Routine' : referral.priority}
                    </span>
                  </td>
                  <td>
                    <span 
                      style={{ 
                        backgroundColor: getStatusColor(referral.status),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    >
                      {referral.status}
                    </span>
                  </td>
                  <td>{formatDate(referral.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <AddReferralModal 
          onClose={() => setShowAddModal(false)}
          onSave={handleAddReferral}
        />
      )}
    </div>
  );
};
```

## 🛡️ ERROR HANDLING

### Common Error Responses
```javascript
const handleReferralError = (error) => {
  if (error.response) {
    switch (error.response.status) {
      case 400:
        // Validation error
        alert(error.response.data.message || "Invalid referral data");
        break;
      case 401:
        // Token expired
        localStorage.removeItem('token');
        window.location.href = '/login';
        break;
      case 403:
        // Insufficient permissions
        alert("You don't have permission to manage referrals");
        break;
      case 404:
        // Referral not found
        alert("Referral not found");
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
const validateReferralData = (data) => {
  const errors = [];
  
  if (!data.patientId || data.patientId.trim() === '') {
    errors.push("Patient ID is required");
  }
  
  if (!data.referralType || data.referralType.trim() === '') {
    errors.push("Referral type is required");
  }
  
  if (!data.reason || data.reason.trim() === '') {
    errors.push("Reason is required");
  }
  
  if (data.reason && data.reason.length > 500) {
    errors.push("Reason cannot exceed 500 characters");
  }
  
  if (!['Low', 'Normal', 'High', 'Urgent'].includes(data.priority)) {
    errors.push("Priority must be: Low, Normal, High, or Urgent");
  }
  
  return errors;
};
```

## 🔄 DATA MAPPING

### Frontend ↔ Backend Mapping
| Frontend Display | Backend Value | Notes |
|-----------------|----------------|--------|
| "Routine" | "Normal" | Map in UI |
| "N/A" | "" or null | Show when PatientExternalId is empty |
| Blue pill | Normal priority | Color mapping |
| Green pill | Pending/Accepted/Completed status | Color mapping |

### Status Color Mapping
```javascript
const statusColors = {
  'Pending': '#FFA500',      // Orange
  'Sent': '#007BFF',        // Blue  
  'Accepted': '#28A745',     // Green
  'InProgress': '#FFC107',   // Yellow
  'Completed': '#28A745',    // Green
  'Cancelled': '#DC3545'      // Red
};
```

### Priority Color Mapping
```javascript
const priorityColors = {
  'Low': '#6C757D',        // Gray
  'Normal': '#007BFF',      // Blue (shows as "Routine")
  'High': '#FD7E14',        // Orange
  'Urgent': '#DC3545'       // Red
};
```

## 🎯 COMPLETE API OPERATIONS

| Operation | Method | Endpoint | Auth Required | Status |
|-----------|--------|----------|---------------|---------|
| Get My Referrals | GET | `/api/referrals/my-referrals` | Yes | ✅ Added |
| Create Referral | POST | `/api/referrals` | Yes | ✅ Existing |
| Get Referral Details | GET | `/api/referrals/{id}` | Yes | ✅ Existing |
| Update Status | PUT | `/api/referrals/{id}/status` | Yes | ✅ Existing |
| Send to External | POST | `/api/referrals/{id}/send` | Yes | ✅ Existing |

## 🚀 READY FOR NEXT SCREENS

The backend now supports all Medical Referrals operations:
- ✅ Get current doctor's referrals
- ✅ Create new referrals
- ✅ Update referral status
- ✅ Send to external systems
- ✅ Proper error handling
- ✅ Data validation
- ✅ Status/priority color mapping

**Ready for remaining Doctor screens!**
