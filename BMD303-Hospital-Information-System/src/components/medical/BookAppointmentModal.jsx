import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import { InputWithLabel, SelectWithLabel } from '../../components/common/Input';
import { XMarkIcon } from '@heroicons/react/24/outline';
import appointmentService from '../../api/appointmentService';
import doctorService from '../../api/doctorService';
import authService from '../../api/authService';
import { unwrapList, getApiErrorMessage } from '../../api/apiUtils';
import { validateAppointment } from '../../utils/validation';
import {
  resolveDoctorId,
  getPatientRecordId,
  normalizeScheduleList,
  getNextDateForScheduleDays,
  DEFAULT_WEEKDAY_SCHEDULE,
  formatScheduleDaysSummary,
} from '../../utils/doctorUtils';
import {
  filterSlotsForDate,
  formatSlotOptionLabel,
} from '../../utils/appointmentUtils';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f3f4f6;
  }
  
  svg {
    width: 24px;
    height: 24px;
    color: #6b7280;
  }
`;

const Form = styled.form`
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const SubmitButton = styled(Button)`
  width: 100%;
  margin-top: 8px;
`;

const getWeekdayName = (dateStr) => {
  if (!dateStr) return '';
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' });
};

const BookAppointmentModal = ({ isOpen, onClose, onSuccess, initialData, title }) => {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [scheduleDays, setScheduleDays] = useState([]);
  const [slotsLoadError, setSlotsLoadError] = useState(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: 'Male',
    dateOfBirth: ''
  });
  
  // Get current user to determine if they can register new patients
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const canRegisterNewPatients = currentUser && (currentUser.role === 'Nurse' || currentUser.role === 'Doctor');
  const [formData, setFormData] = useState({
    doctorId: '',
    patientId: '',
    appointmentDate: '',
    timeSlotId: '',
    reasonForVisit: '',
    status: 'Scheduled',
  });

  const syncSchedulesForDoctor = useCallback(
    async (doctorId) => {
      if (!doctorId) {
        setScheduleDays(DEFAULT_WEEKDAY_SCHEDULE);
        return;
      }

      try {
        const profileDoctorId = await resolveDoctorId(currentUser);
        const isOwnSchedule =
          profileDoctorId != null && Number(doctorId) === Number(profileDoctorId);

        const schedules = isOwnSchedule
          ? normalizeScheduleList(await doctorService.getSchedules())
          : DEFAULT_WEEKDAY_SCHEDULE;

        setScheduleDays(schedules.length ? schedules : DEFAULT_WEEKDAY_SCHEDULE);

        const suggested = getNextDateForScheduleDays(
          schedules.length ? schedules : DEFAULT_WEEKDAY_SCHEDULE
        );
        if (suggested) {
          setFormData((prev) => ({
            ...prev,
            appointmentDate: prev.appointmentDate || suggested,
          }));
        }
      } catch {
        setScheduleDays(DEFAULT_WEEKDAY_SCHEDULE);
      }
    },
    [currentUser]
  );

  const loadDoctors = useCallback(async () => {
    try {
      const isPatient = currentUser?.role === 'Patient';
      const data = isPatient
        ? await doctorService.getBookableDoctors()
        : await doctorService.getAllDoctors();
      const doctorList = unwrapList(data);
      setDoctors(doctorList);

      const profileDoctorId = await resolveDoctorId(currentUser);
      const bookableId = doctorList[0]?.doctorId ?? doctorList[0]?.DoctorId;
      const resolvedId = isPatient ? bookableId : (profileDoctorId || bookableId);

      const resolvedIdStr = resolvedId != null ? String(resolvedId) : '';
      setFormData((prev) => ({
        ...prev,
        doctorId: prev.doctorId && !isPatient ? prev.doctorId : resolvedIdStr,
      }));
      await syncSchedulesForDoctor(resolvedId || null);
    } catch (error) {
      console.error('Error loading doctors:', error);
      const profileDoctorId = await resolveDoctorId(currentUser);
      if (profileDoctorId) {
        setFormData((prev) => ({ ...prev, doctorId: String(profileDoctorId) }));
        await syncSchedulesForDoctor(profileDoctorId);
      } else {
        await syncSchedulesForDoctor(null);
      }
    }
  }, [currentUser, syncSchedulesForDoctor]);

  const loadAvailableSlots = useCallback(async (doctorId, date) => {
    if (!doctorId || !date) {
      setAvailableSlots([]);
      return;
    }

    setLoadingSlots(true);
    setSlotsLoadError(null);
    try {
      const raw = await appointmentService.getAvailableSlots(doctorId, date, date);
      const slots = filterSlotsForDate(unwrapList(raw), date);

      setAvailableSlots(slots);
      if (slots.length === 0) {
        setFormData((prev) => ({ ...prev, timeSlotId: '' }));
      }
    } catch (error) {
      console.error('Error loading available slots:', error);
      setAvailableSlots([]);
      setFormData((prev) => ({ ...prev, timeSlotId: '' }));
      const message = getApiErrorMessage(error, 'Could not load time slots');
      setSlotsLoadError(message);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  // Patient search function
  const handlePatientSearch = async (query) => {
    setPatientSearchQuery(query);
    
    if (!query || query.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const data = await doctorService.searchPatients(query.trim());
      const results = unwrapList(data);
      setSearchResults(results.slice(0, 8));
    } catch (error) {
      console.error('Error searching patients:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    const pid = getPatientRecordId(patient);
    setFormData(prev => ({
      ...prev,
      patientId: pid != null ? String(pid) : '',
    }));
    setPatientSearchQuery(`${patient.firstName} ${patient.lastName}`);
    setSearchResults([]);
    setIsNewPatient(false);
  };

  const handleNewPatientChange = (e) => {
    const { name, value } = e.target;
    setNewPatientData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateAndBook = async () => {
    if (!newPatientData.firstName || !newPatientData.lastName || !newPatientData.email) {
      toast.error('Please fill in patient first name, last name, and email');
      return;
    }

    if (!formData.timeSlotId) {
      toast.error('Please select an available time slot');
      return;
    }

    setLoading(true);
    try {
      const registerResult = await authService.register({
        firstName: newPatientData.firstName,
        lastName: newPatientData.lastName,
        email: newPatientData.email,
        password: 'TempPass1!',
        confirmPassword: 'TempPass1!',
        phoneNumber: newPatientData.phoneNumber || '01234567890',
        role: 'Patient',
        gender: newPatientData.gender || 'Male',
        dateOfBirth: newPatientData.dateOfBirth || '2000-01-01',
      });

      if (!registerResult.success) {
        toast.error(registerResult.message || 'Failed to register patient');
        return;
      }

      toast.success(`Patient ${registerResult.user.firstName} ${registerResult.user.lastName} registered!`);

      const newPatientId = getPatientRecordId(registerResult.user);
      await appointmentService.bookAppointment({
        doctorId: Number(formData.doctorId),
        patientId: Number(newPatientId),
        timeSlotId: Number(formData.timeSlotId),
        reasonForVisit: formData.reasonForVisit || '',
      });
      toast.success('Appointment booked successfully for new patient!');

      onSuccess?.();
      onClose();

      // Reset form
      setFormData({
        doctorId: '1',
        patientId: '',
        appointmentDate: '',
        timeSlotId: '',
        reasonForVisit: '',
        status: 'Scheduled'
      });
      setSelectedPatient(null);
      setPatientSearchQuery('');
      setIsNewPatient(false);
      setNewPatientData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        gender: 'Male',
        dateOfBirth: ''
      });
      setAvailableSlots([]);
    } catch (error) {
      console.error('Error creating patient and booking appointment:', error);
      toast.error(getApiErrorMessage(error, 'Failed to create patient or book appointment'));
    } finally {
      setLoading(false);
    }
  };

  // Now use the functions in useEffect - they're already defined above
  useEffect(() => {
    if (isOpen) {
      setSlotsLoadError(null);
      loadDoctors();
      
      // Auto-select current patient if user is a patient (they can only book for themselves)
      if (currentUser?.role === 'Patient') {
        const patientInfo = {
          userId: currentUser.userId || currentUser.id,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email
        };
        setSelectedPatient(patientInfo);
        setFormData(prev => ({
          ...prev,
          patientId: patientInfo.userId
        }));
        setPatientSearchQuery(`${patientInfo.firstName} ${patientInfo.lastName}`);
      }

      if (initialData) {
        setFormData((prev) => ({
          ...prev,
          doctorId: initialData.doctorId || prev.doctorId,
          appointmentDate: initialData.appointmentDate || prev.appointmentDate,
          timeSlotId: initialData.timeSlotId || prev.timeSlotId,
          reasonForVisit: initialData.reasonForVisit || prev.reasonForVisit,
        }));
      }
    }
  }, [isOpen, initialData, loadDoctors]);

  useEffect(() => {
    if (isOpen && formData.doctorId && formData.appointmentDate) {
      loadAvailableSlots(formData.doctorId, formData.appointmentDate);
    } else {
      setAvailableSlots([]);
      setFormData(prev => ({ ...prev, timeSlotId: '' }));
    }
  }, [isOpen, formData.doctorId, formData.appointmentDate, loadAvailableSlots]);

  useEffect(() => {
    if (isOpen && formData.doctorId) {
      syncSchedulesForDoctor(formData.doctorId);
    }
  }, [isOpen, formData.doctorId, syncSchedulesForDoctor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'doctorId' || name === 'appointmentDate' ? { timeSlotId: '' } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (currentUser?.role !== 'Patient' && !formData.patientId) {
        toast.error('Please select a patient');
        setLoading(false);
        return;
      }

      if (!formData.timeSlotId) {
        toast.error('Please select an available time slot');
        setLoading(false);
        return;
      }

      if (availableSlots.length === 0) {
        toast.error('No time slots for this date. Pick a weekday when the doctor has schedule hours, or add schedule under Doctor → Schedule.');
        setLoading(false);
        return;
      }

      // Validate form using backend validation rules
      const validationErrors = validateAppointment(formData);
      if (Object.keys(validationErrors).length > 0) {
        Object.values(validationErrors).forEach(error => {
          toast.error(error);
        });
        setLoading(false);
        return;
      }

      // Additional validation for appointment date and time
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const appointmentDate = new Date(formData.appointmentDate);
      appointmentDate.setHours(0, 0, 0, 0);

      if (appointmentDate < today) {
        toast.error('Cannot book appointment in the past. Please select a future date.');
        setLoading(false);
        return;
      }

      // If appointment is today, check if the time slot is not in the past
      if (appointmentDate.getTime() === today.getTime()) {
        const selectedSlot = availableSlots.find(slot => String(slot.timeSlotId) === String(formData.timeSlotId));
        if (selectedSlot) {
          const now = new Date();
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();

          // Parse slot start time
          const slotTime = selectedSlot.startTime.substring(0, 5).split(':');
          const slotHour = parseInt(slotTime[0]);
          const slotMinute = parseInt(slotTime[1]);

          // Compare times
          if (slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute)) {
            toast.error('❌ Cannot book appointment in the past. Please select a future time slot.');
            setLoading(false);
            return;
          }
        }
      }

      const appointmentData = {
        doctorId: Number(formData.doctorId),
        timeSlotId: Number(formData.timeSlotId),
        reasonForVisit: formData.reasonForVisit || '',
      };

      if (currentUser?.role !== 'Patient' && formData.patientId) {
        appointmentData.patientId = Number(formData.patientId);
      }

      const isReschedule = Boolean(initialData?.appointmentId);

      if (isReschedule) {
        await appointmentService.rescheduleAppointment(initialData.appointmentId, formData.timeSlotId);
        toast.success('Appointment rescheduled successfully!');
      } else {
        await appointmentService.bookAppointment(appointmentData);
        toast.success('Appointment booked successfully!');
      }

      onSuccess?.();
      onClose();

      // Reset form
      setFormData({
        doctorId: formData.doctorId,
        patientId: '',
        appointmentDate: '',
        timeSlotId: '',
        reasonForVisit: '',
        status: 'Scheduled',
      });
      setSelectedPatient(null);
      setPatientSearchQuery('');
      setAvailableSlots([]);
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(getApiErrorMessage(error, 'Failed to book appointment'));
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>{title || (initialData ? 'Reschedule Appointment' : 'Book New Appointment')}</h2>
          <CloseButton onClick={onClose}>
            <XMarkIcon />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          {/* Patient Search Section */}
          <FormGroup>
            {canRegisterNewPatients && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151'
                }}>
                  Patient <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewPatient(!isNewPatient);
                    setSelectedPatient(null);
                    setPatientSearchQuery('');
                    setSearchResults([]);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isNewPatient ? '#2563eb' : '#6b7280',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0
                  }}
                >
                  {isNewPatient ? '← Back to Search' : '+ Register New Patient'}
                </button>
              </div>
            )}
            
            {!canRegisterNewPatients && (
              <label style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '8px',
                display: 'block'
              }}>
                Patient Information (Auto-filled)
              </label>
            )}

            {!isNewPatient ? (
              // Existing Patient Search
              <>
                <input
                  type="text"
                  value={patientSearchQuery}
                  onChange={(e) => handlePatientSearch(e.target.value)}
                  placeholder="Search by patient ID or name..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: selectedPatient ? '2px solid #15803d' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                
                {isSearching && (
                  <div style={{ padding: '8px', color: '#6b7280', fontSize: '13px' }}>
                    Searching...
                  </div>
                )}
                
                {searchResults.length > 0 && (
                  <div style={{ 
                    marginTop: '8px', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '6px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    backgroundColor: 'white'
                  }}>
                    {searchResults.map((patient) => (
                      <div
                        key={patient.userId}
                        onClick={() => handleSelectPatient(patient)}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f3f4f6',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        <div style={{ fontWeight: 600, color: '#111827' }}>
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          ID: {getPatientRecordId(patient)} • {patient.email}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedPatient && (
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '8px', 
                    backgroundColor: '#dcfce7', 
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#15803d'
                  }}>
                    ✓ Selected: {selectedPatient.firstName} {selectedPatient.lastName} (ID:{' '}
                    {getPatientRecordId(selectedPatient)})
                  </div>
                )}
              </>
            ) : (
              // New Patient Registration Form
              <div style={{ 
                padding: '16px', 
                border: '2px solid #2563eb', 
                borderRadius: '8px',
                backgroundColor: '#eff6ff'
              }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>
                  🆕 New Patient Information
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#374151', marginBottom: '4px', display: 'block' }}>
                      First Name <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={newPatientData.firstName}
                      onChange={handleNewPatientChange}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="e.g., Mohamed"
                    />
                  </div>
                  
                  <div>
                    <label style={{ fontSize: '12px', color: '#374151', marginBottom: '4px', display: 'block' }}>
                      Last Name <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={newPatientData.lastName}
                      onChange={handleNewPatientChange}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="e.g., Ahmed"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#374151', marginBottom: '4px', display: 'block' }}>
                    Email <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newPatientData.email}
                    onChange={handleNewPatientChange}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    placeholder="patient@example.com"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#374151', marginBottom: '4px', display: 'block' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={newPatientData.phoneNumber}
                      onChange={handleNewPatientChange}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="+201xxxxxxxxx"
                    />
                  </div>
                  
                  <div>
                    <label style={{ fontSize: '12px', color: '#374151', marginBottom: '4px', display: 'block' }}>
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={newPatientData.gender}
                      onChange={handleNewPatientChange}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#374151', marginBottom: '4px', display: 'block' }}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={newPatientData.dateOfBirth}
                    onChange={handleNewPatientChange}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ padding: '10px', backgroundColor: '#fef3c7', borderRadius: '6px', fontSize: '12px', color: '#92400e' }}>
                  ℹ️ A patient account will be created with temporary password: <strong>temp123</strong>
                </div>
              </div>
            )}
          </FormGroup>

          {currentUser?.role === 'Patient' && doctors.length === 1 && (
            <FormGroup>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
                Doctor
              </label>
              <div
                style={{
                  padding: '12px 14px',
                  background: '#f3f4f6',
                  borderRadius: 8,
                  fontSize: 15,
                  color: '#111827',
                }}
              >
                Dr. {doctors[0].firstName} {doctors[0].lastName}
                {doctors[0].specialization ? ` — ${doctors[0].specialization}` : ' — Orthopedics'}
              </div>
            </FormGroup>
          )}

          {currentUser?.role !== 'Patient' && doctors.length > 1 && (
            <FormGroup>
              <SelectWithLabel
                label="Doctor"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                required
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => {
                  const id = doctor.doctorId ?? doctor.DoctorId;
                  return (
                    <option key={id} value={id}>
                      {doctor.firstName} {doctor.lastName}
                      {doctor.specialization ? ` — ${doctor.specialization}` : ''}
                    </option>
                  );
                })}
              </SelectWithLabel>
            </FormGroup>
          )}

          {currentUser?.role === 'Patient' && doctors.length === 0 && (
            <FormGroup>
              <p style={{ color: '#b45309', fontSize: 14, margin: 0 }}>
                No orthopedics doctor is available for booking. Please contact the clinic.
              </p>
            </FormGroup>
          )}

          <FormGroup>
            <InputWithLabel
              label="Appointment Date"
              type="date"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={(e) => {
                const selectedDate = new Date(e.target.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (selectedDate < today) {
                  toast.error('❌ Cannot select a date in the past');
                  return;
                }
                handleChange(e);
              }}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              marginTop: '6px',
              padding: '8px',
              backgroundColor: '#f3f4f6',
              borderRadius: '4px'
            }}>
              ℹ️ Only future dates and times can be selected
            </div>
          </FormGroup>

          <FormGroup>
            {slotsLoadError && (
              <div style={{ padding: '12px', marginBottom: '12px', color: '#b91c1c', backgroundColor: '#fef2f2', borderRadius: '8px', fontSize: '13px', lineHeight: 1.5 }}>
                <strong>Could not load time slots.</strong>
                <br />
                {slotsLoadError}
                <br />
                If this mentions the server, ensure the backend is running at{' '}
                <code>http://localhost:5000</code>, then refresh the page.
              </div>
            )}

            {loadingSlots ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                Loading available slots...
              </div>
            ) : availableSlots.length === 0 ? (
              <div style={{ padding: '16px', color: '#92400e', backgroundColor: '#fffbeb', borderRadius: '8px', fontSize: '13px', lineHeight: 1.5 }}>
                <strong>
                  No time slots for{' '}
                  {formData.appointmentDate
                    ? `${getWeekdayName(formData.appointmentDate)} (${formData.appointmentDate})`
                    : 'this date'}
                  .
                </strong>
                <br />
                {scheduleDays.length > 0 ? (
                  <>
                    Working days: <strong>{formatScheduleDaysSummary(scheduleDays)}</strong>.
                    Pick a date on one of those weekdays (Mon–Fri if schedule is not set yet).
                  </>
                ) : (
                  <>
                    You have no working hours yet. Add them under <strong>Doctor → Schedule</strong>.
                  </>
                )}
                {scheduleDays.length > 0 && (
                  <>
                    <br />
                    <br />
                    {(() => {
                      const suggested = getNextDateForScheduleDays(scheduleDays);
                      if (!suggested) return null;
                      return (
                        <Button
                          type="button"
                          variant="secondary"
                          size="small"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, appointmentDate: suggested, timeSlotId: '' }));
                          }}
                        >
                          Use next available day ({suggested}, {getWeekdayName(suggested)})
                        </Button>
                      );
                    })()}
                  </>
                )}
              </div>
            ) : null}

            <SelectWithLabel
              label="Time slot"
              name="timeSlotId"
              value={formData.timeSlotId}
              onChange={handleChange}
              required
              disabled={loadingSlots || !formData.appointmentDate || !formData.doctorId}
              style={{ marginTop: 12 }}
            >
              <option value="">
                {loadingSlots
                  ? 'Loading slots...'
                  : !formData.doctorId
                    ? 'Select a doctor first'
                    : !formData.appointmentDate
                      ? 'Select a date first'
                      : availableSlots.length
                        ? 'Select a time slot'
                        : 'No slots on this date'}
              </option>
              {availableSlots.map((slot) => (
                <option key={slot.timeSlotId} value={slot.timeSlotId}>
                  {formatSlotOptionLabel(slot)}
                </option>
              ))}
            </SelectWithLabel>

          </FormGroup>

          <FormGroup>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '8px'
            }}>
              Reason for Visit
            </label>
            <textarea
              name="reasonForVisit"
              value={formData.reasonForVisit}
              onChange={handleChange}
              rows={4}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
              placeholder="Describe your symptoms or reason for appointment..."
            />
          </FormGroup>

          <SubmitButton 
            type="button"
            variant="primary" 
            size="large"
            disabled={
              loading
              || !formData.doctorId
              || !formData.appointmentDate
              || !formData.timeSlotId
              || (currentUser?.role !== 'Patient' && !formData.patientId && !isNewPatient)
            }
            onClick={() => {
              if (isNewPatient) {
                handleCreateAndBook();
              } else {
                handleSubmit({ preventDefault: () => {} });
              }
            }}
          >
            {loading ? 'Processing...' : (isNewPatient ? 'Register & Book Appointment' : 'Book Appointment')}
          </SubmitButton>
          {!loading && (
            <p style={{ marginTop: '10px', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
              {!formData.patientId && currentUser?.role !== 'Patient' && !isNewPatient
                ? 'Select a patient to enable booking.'
                : !formData.timeSlotId
                  ? 'Choose a time slot from the dropdown to enable booking.'
                  : slotsLoadError
                    ? 'Fix the slot loading error above, then try again.'
                    : null}
            </p>
          )}
        </Form>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default BookAppointmentModal;
