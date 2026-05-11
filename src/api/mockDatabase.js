// Centralized mock database for storing all data in localStorage
// This simulates a real database with persistent storage

const DB_KEY = 'clinic_mock_db';

// Initialize database with seed data
const initializeDB = () => {
  const existingDB = localStorage.getItem(DB_KEY);
  if (existingDB) {
    return JSON.parse(existingDB);
  }

  const initialDB = {
    users: [
      {
        userId: 1,
        email: 'doctor@clinic.com',
        password: '123456',
        firstName: 'Ahmed',
        lastName: 'Nabil',
        phoneNumber: '+201003552925',
        role: 'Doctor',
        specialization: 'Orthopedic Surgeon',
        gender: 'Male',
        dateOfBirth: '1985-05-15'
      },
      {
        userId: 2,
        email: 'patient@clinic.com',
        password: '123456',
        firstName: 'Mohamed',
        lastName: 'Ahmed',
        phoneNumber: '+201003552926',
        role: 'Patient',
        gender: 'Male',
        dateOfBirth: '1990-08-20'
      },
      {
        userId: 3,
        email: 'nurse@clinic.com',
        password: '123456',
        firstName: 'Fatima',
        lastName: 'Hassan',
        phoneNumber: '+201003552927',
        role: 'Nurse',
        gender: 'Female',
        dateOfBirth: '1992-03-10'
      }
    ],
    appointments: [
      {
        appointmentId: 1,
        doctorId: 1,
        doctorName: 'Ahmed Nabil',
        patientId: 2,
        patientName: 'Mohamed Ahmed',
        appointmentDate: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '09:30',
        status: 'Scheduled',
        reasonForVisit: 'Knee pain consultation',
        createdAt: new Date().toISOString()
      },
      {
        appointmentId: 2,
        doctorId: 1,
        doctorName: 'Ahmed Nabil',
        patientId: 2,
        patientName: 'Mohamed Ahmed',
        appointmentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '10:30',
        status: 'Confirmed',
        reasonForVisit: 'Follow-up checkup',
        createdAt: new Date().toISOString()
      }
    ],
    consultations: [],
    prescriptions: [
      {
        prescriptionId: 1,
        doctorId: 1,
        patientId: 2,
        medications: [
          { name: 'Paracetamol', dosage: '500mg', frequency: '3 times a day' },
          { name: 'Ibuprofen', dosage: '200mg', frequency: '2 times a day' }
        ],
        notes: 'Take after meals',
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ],
    referrals: [
      {
        referralId: 1,
        doctorId: 1,
        patientId: 2,
        referralType: 'radiology',
        reason: 'X-ray for knee pain',
        urgency: 'urgent',
        status: 'pending',
        notes: 'Priority case',
        createdAt: new Date().toISOString()
      }
    ],
    schedules: [],
    medicalImages: [],
    notifications: []
  };

  localStorage.setItem(DB_KEY, JSON.stringify(initialDB));
  return initialDB;
};

// Get database instance
const getDB = () => {
  const db = localStorage.getItem(DB_KEY);
  if (!db) {
    return initializeDB();
  }
  return JSON.parse(db);
};

// Save database
const saveDB = (data) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

// User operations
const mockDatabase = {
  // Initialize
  init: initializeDB,

  // User operations
  users: {
    findAll: () => {
      const db = getDB();
      return db.users;
    },
    
    findByEmail: (email) => {
      const db = getDB();
      return db.users.find(u => u.email === email);
    },
    
    findById: (userId) => {
      const db = getDB();
      return db.users.find(u => String(u.userId) === String(userId));
    },
    
    create: (userData) => {
      const db = getDB();
      const newUser = {
        ...userData,
        userId: db.users.length > 0 ? Math.max(...db.users.map(u => u.userId)) + 1 : 1,
        createdAt: new Date().toISOString()
      };
      db.users.push(newUser);
      saveDB(db);
      return newUser;
    },
    
    update: (userId, updates) => {
      const db = getDB();
      const index = db.users.findIndex(u => String(u.userId) === String(userId));
      if (index === -1) return null;
      
      db.users[index] = { ...db.users[index], ...updates };
      saveDB(db);
      return db.users[index];
    }
  },

  // Appointment operations
  appointments: {
    findAll: (filters = {}) => {
      const db = getDB();
      let appointments = db.appointments;
      
      if (filters.doctorId) {
        appointments = appointments.filter(a => String(a.doctorId) === String(filters.doctorId));
      }
      if (filters.patientId) {
        appointments = appointments.filter(a => String(a.patientId) === String(filters.patientId));
      }
      if (filters.date) {
        appointments = appointments.filter(a => a.appointmentDate === filters.date);
      }
      if (filters.status) {
        appointments = appointments.filter(a => a.status === filters.status);
      }
      
      return appointments;
    },
    
    findById: (appointmentId) => {
      const db = getDB();
      return db.appointments.find(a => String(a.appointmentId) === String(appointmentId));
    },
    
    create: (appointmentData) => {
      const db = getDB();
      const doctor = mockDatabase.users.findById(appointmentData.doctorId);
      const patient = mockDatabase.users.findById(appointmentData.patientId);
      
      const newAppointment = {
        ...appointmentData,
        appointmentId: db.appointments.length > 0 
          ? Math.max(...db.appointments.map(a => a.appointmentId)) + 1 
          : 1,
        doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Unknown Doctor',
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
        status: appointmentData.status || 'Scheduled',
        createdAt: new Date().toISOString()
      };
      
      db.appointments.push(newAppointment);
      saveDB(db);
      return newAppointment;
    },
    
    update: (appointmentId, updates) => {
      const db = getDB();
      const index = db.appointments.findIndex(a => String(a.appointmentId) === String(appointmentId));
      if (index === -1) return null;
      
      db.appointments[index] = { ...db.appointments[index], ...updates };
      saveDB(db);
      return db.appointments[index];
    },
    
    delete: (appointmentId) => {
      const db = getDB();
      const index = db.appointments.findIndex(a => String(a.appointmentId) === String(appointmentId));
      if (index === -1) return false;
      
      db.appointments.splice(index, 1);
      saveDB(db);
      return true;
    }
  },

  // Prescription operations
  prescriptions: {
    findAll: (filters = {}) => {
      const db = getDB();
      let prescriptions = db.prescriptions;
      
      if (filters.doctorId) {
        prescriptions = prescriptions.filter(p => String(p.doctorId) === String(filters.doctorId));
      }
      if (filters.patientId) {
        prescriptions = prescriptions.filter(p => String(p.patientId) === String(filters.patientId));
      }
      
      return prescriptions;
    },
    
    create: (prescriptionData) => {
      const db = getDB();
      const newPrescription = {
        ...prescriptionData,
        prescriptionId: db.prescriptions.length > 0 
          ? Math.max(...db.prescriptions.map(p => p.prescriptionId)) + 1 
          : 1,
        status: prescriptionData.status || 'active',
        createdAt: new Date().toISOString()
      };
      
      db.prescriptions.push(newPrescription);
      saveDB(db);
      return newPrescription;
    }
  },

  // Referral operations
  referrals: {
    findAll: (filters = {}) => {
      const db = getDB();
      let referrals = db.referrals;
      
      if (filters.doctorId) {
        referrals = referrals.filter(r => String(r.doctorId) === String(filters.doctorId));
      }
      if (filters.patientId) {
        referrals = referrals.filter(r => String(r.patientId) === String(filters.patientId));
      }
      
      return referrals;
    },
    
    create: (referralData) => {
      const db = getDB();
      const newReferral = {
        ...referralData,
        referralId: db.referrals.length > 0 
          ? Math.max(...db.referrals.map(r => r.referralId)) + 1 
          : 1,
        status: referralData.status || 'pending',
        createdAt: new Date().toISOString()
      };
      
      db.referrals.push(newReferral);
      saveDB(db);
      return newReferral;
    },
    
    update: (referralId, updates) => {
      const db = getDB();
      const index = db.referrals.findIndex(r => String(r.referralId) === String(referralId));
      if (index === -1) return null;
      
      db.referrals[index] = { ...db.referrals[index], ...updates };
      saveDB(db);
      return db.referrals[index];
    }
  },

  // Reset database to initial state
  reset: () => {
    localStorage.removeItem(DB_KEY);
    return initializeDB();
  }
};

// Initialize on load
initializeDB();

export default mockDatabase;
