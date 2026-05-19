import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import { InputWithLabel, SelectWithLabel } from '../../components/common/Input';
import { XMarkIcon } from '@heroicons/react/24/outline';
import appointmentService from '../../api/appointmentService';
import doctorService from '../../api/doctorService';
import { validateAppointment } from '../../utils/validation';

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

const formatTime = (time) => {
  if (!time) return '';
  const str = typeof time === 'string' ? time : '';
  // Handle "HH:mm:ss" and "HH:mm"
  return str.slice(0, 5);
};

const BookAppointmentModal = ({ isOpen, onClose, onSuccess, initialData, title }) => {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
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
    doctorId: '1', // Auto-select the only doctor
    patientId: '',
    appointmentDate: '',
    timeSlotId: '',
    reasonForVisit: '',
    status: 'Scheduled'
  });

  // Define loadDoctors first using useCallback
  const loadDoctors = useCallback(async () => {
    try {
      const data = await doctorService.getAllDoctors();
      const doctorList = Array.isArray(data) ? data : (data?.doctors || data?.data || []);
      setDoctors(doctorList);

      // Auto-select first doctor if available and not already selected
      if (doctorList.length > 0) {
        setFormData(prev => ({
          ...prev,
          doctorId: prev.doctorId || doctorList[0].doctorId
        }));
      }
    } catch (error) {
      console.error('Error loading doctors:', error);

      // Fallback mock doctors with Arabic names for local testing
      const mockDoctors = [
        { doctorId: 1, firstName: 'أحمد', lastName: 'النجار', specialization: 'طبيب عام' },
        { doctorId: 2, firstName: 'سارة', lastName: 'القصير', specialization: 'أمراض قلب' },
      ];
      setDoctors(mockDoctors);

      setFormData(prev => ({
        ...prev,
        doctorId: prev.doctorId || mockDoctors[0].doctorId
      }));
    }
  }, []);

  // Define loadAvailableSlots second
  const loadAvailableSlots = useCallback(async (doctorId, date) => {
    setLoadingSlots(true);
    try {
      // Get available slots for the selected date
      const allSlots = await appointmentService.getAvailableSlots(doctorId, date, date);
      console.log('Returned slots from API:', allSlots);
      console.log('For date:', date, 'and doctorId:', doctorId);
      
      if (Array.isArray(allSlots)) {
        setAvailableSlots(allSlots);
      } else {
        // If API doesn't return data, generate all possible slots and mark booked ones
        const today = new Date().toISOString().split('T')[0];
        const isToday = date === today;
        
        // Generate all time slots from 9:00 AM to 5:00 PM
        const generatedSlots = [];
        const startHour = 9;
        const endHour = 17;
        let slotId = 1;
        
        for (let hour = startHour; hour < endHour; hour++) {
          // :00 slot
          const startTime1 = `${hour.toString().padStart(2, '0')}:00:00`;
          const endTime1 = `${hour.toString().padStart(2, '0')}:30:00`;
          
          // :30 slot
          const startTime2 = `${hour.toString().padStart(2, '0')}:30:00`;
          const endTime2 = `${(hour + 1).toString().padStart(2, '0')}:00:00`;
          
          generatedSlots.push({
            timeSlotId: slotId++,
            slotDate: date,
            startTime: startTime1,
            endTime: endTime1,
            status: 'Available'
          });
          
          generatedSlots.push({
            timeSlotId: slotId++,
            slotDate: date,
            startTime: startTime2,
            endTime: endTime2,
            status: 'Available'
          });
        }
        
        // Check for existing appointments on this date and mark slots as booked
        const existingAppointments = mockDatabase.appointments.findAll({ doctorId, date });
        
        const slotsWithStatus = generatedSlots.map(slot => {
          const isBooked = existingAppointments.some(appt => {
            const apptStart = appt.startTime?.substring(0, 5);
            const slotStart = slot.startTime.substring(0, 5);
            return apptStart === slotStart && (appt.status === 'Scheduled' || appt.status === 'Confirmed' || appt.status === 'Completed');
          });
          
          return {
            ...slot,
            status: isBooked ? 'Booked' : 'Available'
          };
        });
        
        setAvailableSlots(slotsWithStatus);
      }
    } catch (error) {
      console.error('Error loading available slots:', error);

      // Fallback: Generate all possible slots for local testing
      const mockSlots = [];
      const startHour = 9;
      const endHour = 17;
      let slotId = 1;
      
      for (let hour = startHour; hour < endHour; hour++) {
        // :00 slot
        const startTime1 = `${hour.toString().padStart(2, '0')}:00:00`;
        const endTime1 = `${hour.toString().padStart(2, '0')}:30:00`;
        
        // :30 slot
        const startTime2 = `${hour.toString().padStart(2, '0')}:30:00`;
        const endTime2 = `${(hour + 1).toString().padStart(2, '0')}:00:00`;
        
        mockSlots.push({
          timeSlotId: slotId++,
          slotDate: date,
          startTime: startTime1,
          endTime: endTime1,
          status: 'Available'
        });
        
        mockSlots.push({
          timeSlotId: slotId++,
          slotDate: date,
          startTime: startTime2,
          endTime: endTime2,
          status: 'Available'
        });
      }
      
      // Mark booked slots based on existing appointments
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const doctorIdToCheck = currentUser?.role === 'Doctor' ? currentUser.userId : 1;
      const existingAppointments = mockDatabase.appointments.findAll({ doctorId: doctorIdToCheck, date });
      
      const slotsWithStatus = mockSlots.map(slot => {
        const isBooked = existingAppointments.some(appt => {
          const apptStart = appt.startTime?.substring(0, 5);
          const slotStart = slot.startTime.substring(0, 5);
          return apptStart === slotStart && (appt.status === 'Scheduled' || appt.status === 'Confirmed' || appt.status === 'Completed');
        });
        
        return {
          ...slot,
          status: isBooked ? 'Booked' : 'Available'
        };
      });
      
      setAvailableSlots(slotsWithStatus);
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
      // Search in mock database
      const allUsers = mockDatabase.users.findAll();
      const term = query.toLowerCase().trim();
      
      const results = allUsers.filter(u => 
        u.role === 'Patient' && (
          String(u.userId).includes(term) ||
          u.firstName.toLowerCase().includes(term) ||
          u.lastName.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
        )
      );
      
      setSearchResults(results.slice(0, 5)); // Limit to 5 results
    } catch (error) {
      console.error('Error searching patients:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({
      ...prev,
      patientId: patient.userId
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
    // Validate new patient data
    if (!newPatientData.firstName || !newPatientData.lastName || !newPatientData.email) {
      toast.error('Please fill in patient first name, last name, and email');
      return;
    }

    setLoading(true);
    try {
      // Create new patient user account
      const newUser = mockDatabase.users.create({
        firstName: newPatientData.firstName,
        lastName: newPatientData.lastName,
        email: newPatientData.email,
        password: 'temp123', // Temporary password
        role: 'Patient',
        phoneNumber: newPatientData.phoneNumber,
        gender: newPatientData.gender,
        dateOfBirth: newPatientData.dateOfBirth
      });

      console.log('Created new patient:', newUser);
      toast.success(`Patient ${newUser.firstName} ${newUser.lastName} registered successfully!`);

      // Now book appointment with the new patient ID
      const appointmentData = {
        doctorId: 1,
        patientId: newUser.userId,
        appointmentDate: formData.appointmentDate,
        timeSlotId: formData.timeSlotId,
        reasonForVisit: formData.reasonForVisit,
        status: 'Scheduled'
      };

      await appointmentService.bookAppointment(appointmentData);
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
      toast.error(error.response?.data?.message || 'Failed to create patient or book appointment');
    } finally {
      setLoading(false);
    }
  };

  // Now use the functions in useEffect - they're already defined above
  useEffect(() => {
    if (isOpen) {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
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

      // Auto-select the only doctor in the clinic (doctorId: 1)
      const appointmentData = {
        ...formData,
        doctorId: 1 // Only one doctor in this clinic
      };

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
        doctorId: '1',
        patientId: '',
        appointmentDate: '',
        timeSlotId: '',
        reasonForVisit: '',
        status: 'Scheduled'
      });
      setSelectedPatient(null);
      setPatientSearchQuery('');
      setAvailableSlots([]);
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
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
                          ID: {patient.userId} • {patient.email}
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
                    ✓ Selected: {selectedPatient.firstName} {selectedPatient.lastName} (ID: {selectedPatient.userId})
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
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '12px'
            }}>
              Available Time Slots
            </label>
            
            {loadingSlots ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                Loading available slots...
              </div>
            ) : availableSlots.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#dc2626', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
                No time slots available for the selected date.
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                gap: '10px',
                maxHeight: '300px',
                overflowY: 'auto',
                padding: '4px'
              }}>
                {availableSlots.map((slot) => {
                  const isBooked = slot.status === 'Booked';
                  const isSelected = String(formData.timeSlotId) === String(slot.timeSlotId);

                  // Check if slot time is in the past (for today's appointments)
                  let isPastTime = false;
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const appointmentDate = new Date(formData.appointmentDate);
                  appointmentDate.setHours(0, 0, 0, 0);

                  if (appointmentDate.getTime() === today.getTime()) {
                    const now = new Date();
                    const currentHour = now.getHours();
                    const currentMinute = now.getMinutes();
                    const slotTime = slot.startTime.substring(0, 5).split(':');
                    const slotHour = parseInt(slotTime[0]);
                    const slotMinute = parseInt(slotTime[1]);
                    isPastTime = slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute);
                  }

                  return (
                    <button
                      key={slot.timeSlotId}
                      type="button"
                      onClick={() => {
                        if (!isBooked && !isPastTime) {
                          handleChange({
                            target: { name: 'timeSlotId', value: slot.timeSlotId }
                          });
                        }
                      }}
                      disabled={isBooked || isPastTime}
                      title={isPastTime ? 'This time has already passed' : isBooked ? 'This slot is booked' : ''}
                      style={{
                        padding: '10px 8px',
                        border: isSelected
                          ? '2px solid #2563eb'
                          : isPastTime
                          ? '1px solid #d1d5db'
                          : isBooked
                          ? '1px solid #fca5a5'
                          : '1px solid #d1d5db',
                        borderRadius: '8px',
                        backgroundColor: isPastTime
                          ? '#f3f4f6'
                          : isBooked
                          ? '#fef2f2'
                          : isSelected
                          ? '#eff6ff'
                          : 'white',
                        cursor: (isBooked || isPastTime) ? 'not-allowed' : 'pointer',
                        opacity: (isBooked || isPastTime) ? 0.5 : 1,
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (!isBooked && !isPastTime) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isBooked && !isPastTime) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: isPastTime ? '#9ca3af' : (isBooked ? '#dc2626' : (isSelected ? '#2563eb' : '#111827'))
                      }}>
                        {formatTime(slot.startTime)}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: isPastTime ? '#9ca3af' : (isBooked ? '#dc2626' : '#6b7280'),
                        marginTop: '4px'
                      }}>
                        {formatTime(slot.endTime)}
                      </div>
                      {isPastTime && (
                        <div style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#9ca3af'
                        }} />
                      )}
                      {isBooked && (
                        <div style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#dc2626'
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            
            {(availableSlots.some(s => s.status === 'Booked') || availableSlots.some(s => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const appointmentDate = new Date(formData.appointmentDate);
              appointmentDate.setHours(0, 0, 0, 0);
              if (appointmentDate.getTime() === today.getTime()) {
                const now = new Date();
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();
                const slotTime = s.startTime.substring(0, 5).split(':');
                const slotHour = parseInt(slotTime[0]);
                const slotMinute = parseInt(slotTime[1]);
                return slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute);
              }
              return false;
            })) && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {availableSlots.some(s => s.status === 'Booked') && (
                  <div style={{
                    padding: '8px',
                    backgroundColor: '#fef2f2',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#dc2626' }} />
                    Red slots are already booked
                  </div>
                )}
                {availableSlots.some(s => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const appointmentDate = new Date(formData.appointmentDate);
                  appointmentDate.setHours(0, 0, 0, 0);
                  if (appointmentDate.getTime() === today.getTime()) {
                    const now = new Date();
                    const currentHour = now.getHours();
                    const currentMinute = now.getMinutes();
                    const slotTime = s.startTime.substring(0, 5).split(':');
                    const slotHour = parseInt(slotTime[0]);
                    const slotMinute = parseInt(slotTime[1]);
                    return slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute);
                  }
                  return false;
                }) && (
                  <div style={{
                    padding: '8px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#9ca3af' }} />
                    Gray slots have already passed
                  </div>
                )}
              </div>
            )}
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
            disabled={loading}
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
        </Form>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default BookAppointmentModal;
