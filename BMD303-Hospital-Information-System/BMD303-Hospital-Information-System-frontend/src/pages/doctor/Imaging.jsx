import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import '../physio/Appointments.css';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import { useBilling } from '../../billing';
import { formatCurrency } from '../../billing/billingUtils';

const STORAGE_KEY = 'radiologyAppointments';

function readAppointments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDisplayDate(apt) {
  if (apt.date) return apt.date;
  if (apt.appointment_date) {
    try {
      return new Date(apt.appointment_date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return String(apt.appointment_date);
    }
  }
  return '—';
}

function formatDisplayTime(apt) {
  if (apt.time) return apt.time;
  if (apt.appointment_date) {
    try {
      return new Date(apt.appointment_date).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  }
  return '—';
}

function displayPatient(apt) {
  if (apt.patient != null && apt.patient !== '') return apt.patient;
  return apt.patient_id != null ? `Patient #${apt.patient_id}` : '—';
}

function displayService(apt) {
  if (apt.service != null && apt.service !== '') return apt.service;
  return apt.appointment_type || '—';
}

function displayStatus(apt) {
  const s = apt.status;
  if (s == null || s === '') return '—';
  return typeof s === 'string' ? s.charAt(0).toUpperCase() + s.slice(1) : String(s);
}

const normalizeServiceName = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const isCompletedStatus = (value) => ['completed', 'complete', 'done', 'finished'].includes(String(value || '').toLowerCase());

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

const Imaging = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { servicesState, createInvoice } = useBilling();

  const loadData = useCallback(() => {
    setAppointments(readAppointments());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    const onUpdated = () => loadData();
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY || e.key === null) loadData();
    };
    window.addEventListener('radiology-appointments-updated', onUpdated);
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', loadData);
    return () => {
      window.removeEventListener('radiology-appointments-updated', onUpdated);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', loadData);
    };
  }, [loadData]);

  const services = useMemo(() => servicesState.items || [], [servicesState.items]);

  const getServiceForAppointment = useCallback(
    (apt) => {
      const serviceName = displayService(apt);
      const normalizedAppointment = normalizeServiceName(serviceName);
      return (
        services.find((service) => normalizeServiceName(service.serviceName) === normalizedAppointment)
        || services.find((service) => normalizedAppointment.includes(normalizeServiceName(service.serviceName)))
      );
    },
    [services]
  );

  useEffect(() => {
    if (!appointments.length || !services.length) return;
    let isCancelled = false;

    const createBilling = async () => {
      let updatedAppointments = appointments;
      let changed = false;

      for (const apt of appointments) {
        if (!isCompletedStatus(apt.status) || apt.billingCreated) continue;
        const service = getServiceForAppointment(apt);
        if (!service) continue;

        const invoice = await createInvoice({
          patientId: apt.patient_id ? `RAD-${apt.patient_id}` : `RAD-${apt.id}`,
          patientName: displayPatient(apt),
          department: service.department,
          serviceId: service.id,
          serviceName: service.serviceName,
          price: service.price,
        });

        updatedAppointments = updatedAppointments.map((item) =>
          item.id === apt.id
            ? { ...item, billingCreated: true, billingInvoiceId: invoice?.id || null }
            : item
        );
        changed = true;
      }

      if (changed && !isCancelled) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAppointments));
        setAppointments(updatedAppointments);
      }
    };

    createBilling();
    return () => {
      isCancelled = true;
    };
  }, [appointments, services, createInvoice, getServiceForAppointment]);

  if (loading) {
    return (
      <PageContainer>
        <Card size="large">
          <CardBody>
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
              Loading imaging appointments...
            </div>
          </CardBody>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <h1>Medical Imaging & Lab Tests</h1>
        <p>Track imaging appointments and billing status</p>
      </Header>

      <Card size="large">
        <CardHeader>
          <h3>Imaging Appointments</h3>
        </CardHeader>
        <CardBody>
          <div className="appointments-table-container">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      No imaging appointments yet.
                    </td>
                  </tr>
                ) : (
                  appointments.map((apt) => {
                    const service = getServiceForAppointment(apt);
                    return (
                      <tr key={apt.id}>
                        <td>{displayPatient(apt)}</td>
                        <td>{displayService(apt)}</td>
                        <td>{formatDisplayDate(apt)}</td>
                        <td>{formatDisplayTime(apt)}</td>
                        <td>
                          <span
                            className={`status-badge status-${String(apt.status || '')
                              .toLowerCase()
                              .replace(/\s+/g, '-')}`}
                          >
                            {displayStatus(apt)}
                          </span>
                        </td>
                        <td>{service ? formatCurrency(service.price) : '—'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </PageContainer>
  );
};

export default Imaging;
