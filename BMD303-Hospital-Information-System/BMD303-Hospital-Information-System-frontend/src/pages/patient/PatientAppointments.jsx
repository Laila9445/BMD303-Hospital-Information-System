import { useState, useEffect } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import appointmentService from '../../api/appointmentService';
import { unwrapList } from '../../api/apiUtils';
import { getPatientRecordId } from '../../utils/doctorUtils';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { CalendarDaysIcon, ClockIcon, CheckCircleIcon, XCircleIcon, PlusIcon, ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';
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

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState(null);
  
  // Get current logged-in patient
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const patientId = getPatientRecordId(currentUser);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await appointmentService.getMyAppointments();
      let appointmentList = unwrapList(data);
      if (patientId != null) {
        appointmentList = appointmentList.filter(
          (appt) =>
            String(appt.patientId) === String(patientId) ||
            String(appt.patientUserId) === String(patientId)
        );
      }
      setAppointments(appointmentList);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError(err.message || 'Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await appointmentService.cancelAppointment(appointmentId);
      toast.success('Appointment cancelled successfully!');
      loadAppointments(); // Refresh list
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      
      toast.error('Failed to cancel appointment');
    }
  };

  const handleRescheduleAppointment = (appointment) => {
    setAppointmentToReschedule(appointment);
    setIsBookingModalOpen(true);
  };

  return (
    <PageContainer>
      <Header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>My Appointments</h1>
            <p>View and manage your scheduled appointments</p>
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
          ) : error && appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>Error Loading Appointments</h3>
              <p style={{ color: '#6b7280', marginBottom: '16px' }}>{error}</p>
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>Showing demo data...</p>
            </div>
          ) : appointments.length > 0 ? (
            <AppointmentsGrid>
              {appointments.map((appointment) => (
                <AppointmentCard key={appointment.appointmentId}>
                  <CardBody>
                    <AppointmentHeader>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                          Your Appointment
                        </h3>
                        <p style={{ fontSize: '13px', color: '#6b7280' }}>
                          Orthopedic Clinic Visit
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
                        <span>{appointment.startTime?.substring(0, 5)} - {appointment.endTime?.substring(0, 5)}</span>
                      </div>
                    </AppointmentInfo>

                    {appointment.reasonForVisit && (
                      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                        <strong style={{ fontSize: '13px', color: '#374151' }}>Reason for Visit: </strong>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>{appointment.reasonForVisit}</span>
                      </div>
                    )}

                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                      {(appointment.status === 'Scheduled' || appointment.status === 'Confirmed') && (
                        <>
                          <Button 
                            size="small" 
                            variant="secondary"
                            onClick={() => handleRescheduleAppointment(appointment)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <ArrowPathIcon style={{ width: '16px', height: '16px' }} />
                            Reschedule
                          </Button>
                          <Button 
                            size="small" 
                            variant="danger"
                            onClick={() => handleCancelAppointment(appointment.appointmentId)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <TrashIcon style={{ width: '16px', height: '16px' }} />
                            Cancel
                          </Button>
                        </>
                      )}
                      {appointment.status === 'Completed' && (
                        <Button size="small" variant="outline" disabled>
                          Completed
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </AppointmentCard>
              ))}
            </AppointmentsGrid>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <CalendarDaysIcon style={{ width: '64px', height: '64px', color: '#d1d5db', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No Appointments Yet</h3>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                You haven't scheduled any appointments yet.
              </p>
              <Button onClick={() => setIsBookingModalOpen(true)}>Book an Appointment</Button>
            </div>
          )}
        </CardBody>
      </Card>

      <BookAppointmentModal 
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setAppointmentToReschedule(null);
        }}
        onSuccess={() => loadAppointments()}
        initialData={appointmentToReschedule}
      />
    </PageContainer>
  );
};

export default PatientAppointments;
