// Mock data utilities for front-end testing when backend is unavailable.
// Includes Arabic names for doctors and patients.



const getMockDoctors = () => [...mockDoctors];

const formatISODate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
};

// Generate mock time slots for a given doctor and date


const getMockTimeSlots = (doctorId, date) => {
  const slotDate = formatISODate(date);
  if (!slotDate) return [];

  // Simple predictable time slots: 09:00, 09:30, 10:00
  return [
    { timeSlotId: `${doctorId}-${slotDate}-1`, slotDate, startTime: '09:00:00', endTime: '09:30:00', status: 'Available' },
    { timeSlotId: `${doctorId}-${slotDate}-2`, slotDate, startTime: '09:30:00', endTime: '10:00:00', status: 'Available' },
    { timeSlotId: `${doctorId}-${slotDate}-3`, slotDate, startTime: '10:00:00', endTime: '10:30:00', status: 'Available' },
  ];
};

const getMockDoctorAppointments = (doctorId, date) => {
  const dateStr = formatISODate(date);
  return mockAppointments.filter((appt) => {
    const matchesDoctor = doctorId ? String(appt.doctorId) === String(doctorId) : true;
    const matchesDate = dateStr ? String(appt.appointmentDate) === String(dateStr) : true;
    return matchesDoctor && matchesDate;
  });
};

const searchMockPatients = (query) => {
  const term = String(query || '').trim().toLowerCase();
  if (!term) return [];

  return mockPatients.filter((p) =>
    String(p.patientId).toLowerCase().includes(term) ||
    String(p.firstName).toLowerCase().includes(term) ||
    String(p.lastName).toLowerCase().includes(term) ||
    String(p.email).toLowerCase().includes(term)
  );
};

const mockAppointments = [];
let mockAppointmentId = 1;

const addMockAppointment = ({ doctorId, patientId, timeSlot, reasonForVisit }) => {
  const patient = mockPatients.find((p) => String(p.patientId) === String(patientId));
  const doctor = mockDoctors.find((d) => String(d.doctorId) === String(doctorId));

  const appointment = {
    appointmentId: mockAppointmentId++,
    doctorId,
    doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : 'دكتور غير معروف',
    patientId,
    patientName: patient ? `${patient.firstName} ${patient.lastName}` : patientId,
    appointmentDate: timeSlot?.slotDate || formatISODate(new Date()),
    startTime: (timeSlot?.startTime || '09:00:00').slice(0, 5),
    endTime: (timeSlot?.endTime || '09:30:00').slice(0, 5),
    status: 'Scheduled',
    reasonForVisit: reasonForVisit || '',
  };
  mockAppointments.push(appointment);
  return appointment;
};

// Seed a couple of appointments so dashboards show content by default
addMockAppointment({
  doctorId: 1,
  patientId: 'patient-123',
  timeSlot: { slotDate: formatISODate(new Date()), startTime: '09:00:00', endTime: '09:30:00' },
  reasonForVisit: 'متابعة حالة الضغط',
});

addMockAppointment({
  doctorId: 1,
  patientId: 'patient-456',
  timeSlot: { slotDate: formatISODate(new Date()), startTime: '10:00:00', endTime: '10:30:00' },
  reasonForVisit: 'ألم في الظهر',
});

const getMockAppointmentsForPatient = (patientId) => {
  if (!patientId) {
    // Return all mock appointments when no patient is specified (useful for demo / fallback mode)
    return [...mockAppointments];
  }
  return mockAppointments.filter((appt) => String(appt.patientId) === String(patientId));
};

const getMockAppointmentDetails = (appointmentId) => {
  return mockAppointments.find((appt) => String(appt.appointmentId) === String(appointmentId)) || null;
};

const mockReferrals = [];
let mockReferralId = 1;

const addMockReferral = ({ patientId, referralType, reason, urgency, notes, doctorId }) => {
  const referral = {
    referralId: mockReferralId++,
    id: mockReferralId - 1,
    doctorId,
    patientId,
    referralType,
    reason: reason || 'General checkup',
    urgency: urgency || 'routine',
    status: 'pending',
    createdAt: new Date().toISOString(),
    notes: notes || '',
  };
  mockReferrals.push(referral);
  return referral;
};

// Seed some initial mock referrals so UI has data without needing backend.
addMockReferral({
  doctorId: 1,
  patientId: 'patient-123',
  referralType: 'radiology',
  reason: 'فحص بالأشعة',
  urgency: 'urgent',
  notes: 'يحتاج إلى فحص عاجل',
});

addMockReferral({
  doctorId: 1,
  patientId: 'patient-456',
  referralType: 'pharmacy',
  reason: 'وصف دواء جديد',
  urgency: 'routine',
  notes: 'وصفت أدوية جديدة لتحسين الحالة',
});

const getMockDoctorReferrals = (doctorId) => {
  return mockReferrals.filter((r) => String(r.doctorId) === String(doctorId));
};

const getMockPatientReferrals = (patientId) => {
  return mockReferrals.filter((r) => String(r.patientId) === String(patientId));
};

const getMockReferralDetails = (referralId) => {
  return mockReferrals.find((r) => String(r.referralId) === String(referralId)) || null;
};

const updateMockReferralStatus = (referralId, status) => {
  const referral = mockReferrals.find((r) => String(r.referralId) === String(referralId));
  if (!referral) return null;
  referral.status = status;
  return referral;
};

// --- Prescriptions (Mock Data) ---
const mockPrescriptions = [];
let mockPrescriptionId = 1;

const addMockPrescription = ({ doctorId, patientId, medications = [], notes = '', status = 'active' }) => {
  const prescription = {
    prescriptionId: mockPrescriptionId++,
    doctorId,
    patientId,
    medications,
    notes,
    status,
    createdAt: new Date().toISOString(),
  };
  mockPrescriptions.push(prescription);
  return prescription;
};

// Seed a couple of prescriptions so the UI has data without backend.
addMockPrescription({
  doctorId: 1,
  patientId: 'patient-123',
  medications: [
    { name: 'Paracetamol', dosage: '500mg', frequency: '3 times a day' },
    { name: 'Ibuprofen', dosage: '200mg', frequency: '2 times a day' }
  ],
  notes: 'Take after meals',
  status: 'active',
});

addMockPrescription({
  doctorId: 1,
  patientId: 'patient-456',
  medications: [
    { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily' }
  ],
  notes: 'Monitor blood pressure regularly',
  status: 'active',
});

const getMockDoctorPrescriptions = (doctorId) => {
  return mockPrescriptions.filter((p) => String(p.doctorId) === String(doctorId));
};

const getMockPatientPrescriptions = (patientId) => {
  return mockPrescriptions.filter((p) => String(p.patientId) === String(patientId));
};

const getMockPrescriptionDetails = (prescriptionId) => {
  return mockPrescriptions.find((p) => String(p.prescriptionId) === String(prescriptionId)) || null;
};

export {
  getMockDoctors,
  getMockTimeSlots,
  getMockDoctorAppointments,
  searchMockPatients,
  addMockAppointment,
  getMockAppointmentsForPatient,
  getMockAppointmentDetails,
  addMockReferral,
  getMockDoctorReferrals,
  getMockPatientReferrals,
  getMockReferralDetails,
  updateMockReferralStatus,
  addMockPrescription,
  getMockDoctorPrescriptions,
  getMockPatientPrescriptions,
  getMockPrescriptionDetails,
};
