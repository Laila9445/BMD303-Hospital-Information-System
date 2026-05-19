import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import doctorService from '../../api/doctorService';
import { unwrapList } from '../../api/apiUtils';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import {
  ClipboardDocumentIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useBilling } from '../../billing';

const PageContainer = styled.div`
  padding: 32px;
  background-color: #f9fafb;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 32px;

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

const InfoBanner = styled.div`
  padding: 14px 18px;
  border-radius: 10px;
  margin-bottom: 24px;
  font-size: 14px;
  line-height: 1.5;
  background: #eff6ff;
  color: #1e40af;
  border: 1px solid #bfdbfe;
`;

const AppointmentRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;

  &:not(:last-child) {
    margin-bottom: 12px;
  }
`;

const getAppointmentPatientId = (appointment) =>
  appointment?.patientId ?? appointment?.PatientId ?? appointment?.patientUserId ?? null;

const Consultations = () => {
  const navigate = useNavigate();
  const { invoicesState } = useBilling();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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
    return invoice.status;
  };

  const canStart = (appointment) => {
    const paymentStatus = getPaymentStatus(appointment.appointmentId);
    return (
      paymentStatus === 'Paid' ||
      ['Confirmed', 'CheckedIn', 'InProgress', 'Completed'].includes(appointment.status)
    );
  };

  const loadToday = useCallback(async () => {
    setLoading(true);
    try {
      const data = await doctorService.getTodayAppointments();
      setAppointments(unwrapList(data));
    } catch (error) {
      console.error(error);
      toast.error('Failed to load today’s appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadToday();
    const onFocus = () => loadToday();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadToday]);

  const handleStart = (appointment) => {
    const pid = getAppointmentPatientId(appointment);
    if (pid == null) {
      toast.error('Patient ID missing on this appointment');
      return;
    }
    navigate(`/doctor/patients/${pid}/consultation`, { state: { appointment } });
  };

  return (
    <PageContainer>
      <Header>
        <h1>Medical Consultations</h1>
        <p>Start a consultation from today’s appointments or open any patient record</p>
      </Header>

      <InfoBanner>
        <strong>When can you start?</strong> After the appointment invoice is <strong>Paid</strong>, or when
        status is <strong>Confirmed</strong>, <strong>Checked In</strong>, or <strong>In Progress</strong>.
        Upload images anytime from the consultation page — they are saved on the server and remain after refresh.
      </InfoBanner>

      <Card size="large">
        <CardHeader>
          <h3 style={{ margin: 0 }}>Today’s appointments</h3>
        </CardHeader>
        <CardBody>
          {loading ? (
            <p style={{ color: '#6b7280', margin: 0 }}>Loading...</p>
          ) : appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <ClipboardDocumentIcon style={{ width: 60, height: 60, margin: '0 auto 16px', color: '#d1d5db' }} />
              <h3 style={{ margin: '0 0 8px 0' }}>No appointments today</h3>
              <p style={{ margin: 0 }}>Book from Appointments or search a patient on the dashboard</p>
            </div>
          ) : (
            appointments.map((appointment) => {
              const paymentStatus = getPaymentStatus(appointment.appointmentId);
              const eligible = canStart(appointment);
              return (
                <AppointmentRow key={appointment.appointmentId}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                      {appointment.patientName || 'Patient'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#6b7280' }}>
                      <ClockIcon style={{ width: 16, height: 16 }} />
                      {appointment.startTime?.slice(0, 5)} – {appointment.endTime?.slice(0, 5)} · {appointment.status}
                      {' · '}
                      {paymentStatus === 'Paid' ? 'Paid' : paymentStatus === 'Not Invoiced' ? 'Not invoiced' : 'Payment pending'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {eligible ? (
                      <span style={{ fontSize: 13, color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircleIcon style={{ width: 18, height: 18 }} /> Ready
                      </span>
                    ) : (
                      <span style={{ fontSize: 13, color: '#b45309', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ExclamationCircleIcon style={{ width: 18, height: 18 }} /> Payment / check-in
                      </span>
                    )}
                    <Button size="small" variant="primary" disabled={!eligible} onClick={() => handleStart(appointment)}>
                      Start consultation
                    </Button>
                  </div>
                </AppointmentRow>
              );
            })
          )}
        </CardBody>
      </Card>
    </PageContainer>
  );
};

export default Consultations;
