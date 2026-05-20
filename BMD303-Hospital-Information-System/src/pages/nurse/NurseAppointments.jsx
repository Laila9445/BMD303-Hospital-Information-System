import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import appointmentService from '../../api/appointmentService';
import mockDatabase from '../../api/mockDatabase';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { CalendarDaysIcon, ClockIcon, PlusIcon } from '@heroicons/react/24/outline';
import { getStatusColor, getStatusText } from '../../utils/statusUtils';
import BookAppointmentModal from '../../components/medical/BookAppointmentModal';

const PageContainer = styled.div`
  padding: 24px;
  background-color: #f9fafb;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 24px;
  
  h1 {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }
`;

const AppointmentsGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const AppointmentCard = styled(Card)`
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const AppointmentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
`;

const AppointmentInfo = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  
  > div {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #374151;
    
    svg {
      width: 18px;
      height: 18px;
      color: #6b7280;
    }
  }
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => props.bgColor || '#eff6ff'};
  color: ${props => props.color || '#1d4ed8'};
`;

const NurseAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      console.log('Loading all appointments for nurse view...');
      
      // Try to get real appointments from service
      try {
        const data = await appointmentService.getNurseAppointments();
        const allAppointments = Array.isArray(data) ? data : (data?.appointments || []);
        console.log('Real API appointments:', allAppointments);
        setAppointments(allAppointments);
      } catch (apiError) {
        // Fallback to mock database - get ALL appointments (nurses see everything)
        console.log('Using mock database for nurse appointments');
        const today = new Date().toISOString().split('T')[0];
        const allAppointments = mockDatabase.appointments.findAll({ date: today });
        console.log('Mock database appointments:', allAppointments);
        setAppointments(allAppointments);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const getPatientIdFilter = () => {
    const params = new URLSearchParams(location.search);
    const patientId = params.get('patientId');
    return patientId ? Number(patientId) : null;
  };

  const getFilteredAppointments = () => {
    const patientIdFilter = getPatientIdFilter();
    if (!patientIdFilter) return appointments;
    return appointments.filter((appt) => appt.patientId === patientIdFilter);
  };

  const updateAppointmentStatus = (appointmentId, status) => {
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.appointmentId === appointmentId ? { ...appt, status } : appt
      )
    );
  };

  const handleCancel = (appointmentId) => {
    updateAppointmentStatus(appointmentId, 'Cancelled');
    toast.success('Appointment cancelled');
  };

  const handleComplete = (appointmentId) => {
    updateAppointmentStatus(appointmentId, 'Completed');
    toast.success('Appointment marked as completed');
  };

  const handleReschedule = (appointment) => {
    setActiveAppointment(appointment);
    setIsBookingModalOpen(true);
    toast('Select a new date/time to reschedule', { icon: '⏰' });
  };

  const handleModalSuccess = () => {
    setActiveAppointment(null);
    loadAppointments();
  };

  const filteredAppointments = getFilteredAppointments();

  return (
    <PageContainer>
      <Header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Appointments Management</h1>
            <p>View and manage today's appointments</p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => setIsBookingModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <PlusIcon style={{ width: '20px', height: '20px' }} />
            Book Appointment
          </Button>
        </div>
      </Header>

      <Card size="large">
        <CardBody>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <h3>Loading appointments...</h3>
              <p>Please wait</p>
            </div>
          ) : filteredAppointments.length > 0 ? (
            <AppointmentsGrid>
              {filteredAppointments.map((appointment) => (
                <AppointmentCard key={appointment.appointmentId}>
                  <CardBody>
                    <AppointmentHeader>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                          {appointment.patientName}
                        </h3>
                        <p style={{ fontSize: '13px', color: '#6b7280' }}>
                          Clinic Appointment
                        </p>
                      </div>
                      <StatusBadge 
                        bgColor={getStatusColor(appointment.status)}
                        color={getStatusColor(appointment.status).replace('rgba', 'rgb').replace(/[\d.]+\)$/, '1)')}
                      >
                        {getStatusText(appointment.status)}
                      </StatusBadge>
                    </AppointmentHeader>

                    <AppointmentInfo>
                      <div>
                        <CalendarDaysIcon />
                        <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <ClockIcon />
                        <span>{appointment.startTime} - {appointment.endTime}</span>
                      </div>
                    </AppointmentInfo>

                    {appointment.reasonForVisit && (
                      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                        <strong style={{ fontSize: '13px', color: '#374151' }}>Reason: </strong>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>{appointment.reasonForVisit}</span>
                      </div>
                    )}

                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                      {appointment.status === 'Scheduled' && (
                        <>
                          <Button size="small" variant="danger" onClick={() => handleCancel(appointment.appointmentId)}>
                            Cancel
                          </Button>
                          <Button
                            size="small"
                            variant="outline"
                            onClick={() => handleReschedule(appointment)}
                          >
                            Reschedule
                          </Button>
                        </>
                      )}
                      {(appointment.status === 'CheckedIn' || appointment.status === 'InProgress') && (
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => handleComplete(appointment.appointmentId)}
                        >
                          Mark Complete
                        </Button>
                      )}
                      {appointment.status === 'Cancelled' && (
                        <span style={{ fontSize: '13px', color: '#9ca3af' }}>Cancelled</span>
                      )}
                      {appointment.status === 'Completed' && (
                        <span style={{ fontSize: '13px', color: '#15803d' }}>Completed</span>
                      )}
                    </div>
                  </CardBody>
                </AppointmentCard>
              ))}
            </AppointmentsGrid>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <CalendarDaysIcon style={{ width: '64px', height: '64px', color: '#d1d5db', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No Appointments Found</h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                {filteredAppointments.length === 0 ? 'Try booking a new appointment or adjust the patient filter.' : ''}
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      <BookAppointmentModal 
        isOpen={isBookingModalOpen}
        initialData={activeAppointment}
        title={activeAppointment ? 'Reschedule Appointment' : 'Book New Appointment'}
        onClose={() => {
          setIsBookingModalOpen(false);
          setActiveAppointment(null);
        }}
        onSuccess={handleModalSuccess}
      />
    </PageContainer>
  );
};

export default NurseAppointments;
