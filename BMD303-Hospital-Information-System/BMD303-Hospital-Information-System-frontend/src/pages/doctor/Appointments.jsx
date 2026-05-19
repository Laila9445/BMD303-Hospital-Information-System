import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import doctorService from '../../api/doctorService';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { InputWithLabel } from '../../components/common/Input';
import { CalendarDaysIcon, MagnifyingGlassIcon, ClockIcon, UserCircleIcon, PlusIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import BookAppointmentModal from '../../components/medical/BookAppointmentModal';
import { useAuth } from '../../context/AuthContext';
import { useBilling } from '../../billing';

const PageContainer = styled.div`
  padding: 32px;
  background-color: #f9fafb;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  
  > div {
    flex: 1;
  }
  
  h1 {
    font-size: 32px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 16px;
    color: #6b7280;
    margin: 0;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: flex-end;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: right;
    padding: 12px;
    background-color: #f9fafb;
    font-weight: 600;
    color: #374151;
    font-size: 14px;
    border-bottom: 2px solid #e5e7eb;
  }
  
  td {
    padding: 16px 12px;
    border-bottom: 1px solid #e5e7eb;
    color: #111827;
    font-size: 15px;
  }
  
  tr:hover {
    background-color: #f9fafb;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  background-color: ${({ status }) => {
    switch (status) {
      case 'Scheduled': return '#fef3c7';
      case 'Confirmed': return '#dcfce7';
      case 'CheckedIn': return '#dbeafe';
      case 'InProgress': return '#ede9fe';
      case 'Completed': return '#dcfce7';
      case 'Cancelled': return '#fee2e2';
      case 'Payment Pending': return '#fef3c7';
      default: return '#f3f4f6';
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'Scheduled': return '#b45309';
      case 'Confirmed': return '#15803d';
      case 'CheckedIn': return '#1d4ed8';
      case 'InProgress': return '#6d28d9';
      case 'Completed': return '#15803d';
      case 'Cancelled': return '#b91c1c';
      case 'Payment Pending': return '#b45309';
      default: return '#374151';
    }
  }};
`;

const PaymentBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${({ $status }) => {
    switch ($status) {
      case 'Paid': return '#dcfce7';
      case 'Pending': return '#fef3c7';
      case 'Payment Pending': return '#fef3c7';
      default: return '#f3f4f6';
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case 'Paid': return '#15803d';
      case 'Pending': return '#b45309';
      case 'Payment Pending': return '#b45309';
      default: return '#6b7280';
    }
  }};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const DoctorAppointments = () => {
  const { user } = useAuth();
  const { invoicesState } = useBilling();
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];
  
  // Get current logged-in doctor ID
  const currentUser = user || JSON.parse(localStorage.getItem('user'));
  const doctorId = currentUser?.userId || currentUser?.id || 1;

  useEffect(() => {
    loadAppointments();
  }, [selectedDate]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      console.log('Loading appointments for doctor:', doctorId, 'on date:', selectedDate);
      const data = await doctorService.getAppointments(selectedDate);
      console.log('Appointments loaded:', data);
      
      // Filter appointments for the current logged-in doctor only
      const filteredAppointments = Array.isArray(data) 
        ? data.filter(appt => String(appt.doctorId) === String(doctorId))
        : [];
      
      setAppointments(filteredAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'Scheduled': 'Scheduled',
      'Confirmed': 'Confirmed',
      'CheckedIn': 'Checked In',
      'InProgress': 'In Progress',
      'Completed': 'Completed',
      'Cancelled': 'Cancelled',
      'Payment Pending': 'Payment Pending',
    };
    return statusMap[status] || status;
  };

  // Build a map of appointment invoices for payment status lookup
  const appointmentInvoices = useMemo(() => {
    const map = new Map();
    (invoicesState.items || []).forEach((invoice) => {
      if (invoice.referenceType === 'Appointment' && invoice.referenceId) {
        map.set(String(invoice.referenceId), invoice);
      }
    });
    return map;
  }, [invoicesState.items]);

  const getPaymentStatus = (appointmentId) => {
    const invoice = appointmentInvoices.get(String(appointmentId));
    if (!invoice) return 'Not Invoiced';
    return invoice.status; // 'Pending', 'Paid', 'Cancelled'
  };

  const handleAppointmentSuccess = () => {
    loadAppointments();
  };

  return (
    <PageContainer>
      <Header>
        <div>
          <h1>Appointment Management</h1>
          <p>View and manage patient appointments</p>
        </div>
        <HeaderActions>
          <Button 
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <PlusIcon style={{ width: '18px', height: '18px' }} />
            Add Appointment
          </Button>
        </HeaderActions>
      </Header>

      <Card size="large">
        <CardHeader>
          <h3>Your Appointments for {format(new Date(selectedDate), 'MMMM dd, yyyy')}</h3>
        </CardHeader>
        <CardBody>
          <FilterBar>
            <div style={{ flex: 1 }}>
              <InputWithLabel
                label="Select Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={today}
              />
            </div>
            <Button variant="primary" onClick={loadAppointments}>
              <MagnifyingGlassIcon style={{ width: '20px', height: '20px' }} />
              Search
            </Button>
          </FilterBar>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              Loading...
            </div>
          ) : appointments.length > 0 ? (
            <Table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Time</th>
                  <th>Reason for Visit</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Consultation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => {
                  const paymentStatus = getPaymentStatus(appointment.appointmentId);
                  const canStartConsultation = paymentStatus === 'Paid' || appointment.status === 'Confirmed' || appointment.status === 'CheckedIn' || appointment.status === 'InProgress';
                  return (
                    <tr key={appointment.appointmentId}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <UserCircleIcon style={{ width: '32px', height: '32px', color: '#9ca3af' }} />
                          <span style={{ fontWeight: 500 }}>{appointment.patientName}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <ClockIcon style={{ width: '18px', height: '18px', color: '#6b7280' }} />
                          {appointment.startTime?.substring(0, 5)} - {appointment.endTime?.substring(0, 5)}
                        </div>
                      </td>
                      <td>{appointment.reasonForVisit || '-'}</td>
                      <td>
                        <StatusBadge status={appointment.status}>
                          {getStatusText(appointment.status)}
                        </StatusBadge>
                      </td>
                      <td>
                        <PaymentBadge $status={paymentStatus}>
                          {paymentStatus === 'Paid' && <CheckCircleIcon />}
                          {(paymentStatus === 'Pending' || paymentStatus === 'Payment Pending') && <ExclamationCircleIcon />}
                          {paymentStatus === 'Not Invoiced' ? 'Not Invoiced' : paymentStatus === 'Paid' ? 'Paid' : 'Payment Pending'}
                        </PaymentBadge>
                      </td>
                      <td>
                        {canStartConsultation ? (
                          <span style={{ fontSize: '13px', color: '#15803d', fontWeight: 600 }}>Eligible</span>
                        ) : (
                          <span style={{ fontSize: '13px', color: '#b45309', fontWeight: 600 }}>Payment Required</span>
                        )}
                      </td>
                      <td>
                        <Button 
                          size="small" 
                          variant="primary"
                          disabled={!canStartConsultation}
                          onClick={() => console.log('View appointment', appointment.appointmentId)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              No appointments on this date
            </div>
          )}
        </CardBody>
      </Card>

      <BookAppointmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleAppointmentSuccess}
        title="Add New Appointment"
      />
    </PageContainer>
  );
};

export default DoctorAppointments;
