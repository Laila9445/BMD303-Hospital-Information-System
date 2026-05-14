import { useMemo } from 'react';
import styled from 'styled-components';
import doctorService from '../../api/doctorService';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ClipboardDocumentIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useBilling } from '../../billing';
import { formatCurrency } from '../../billing/billingUtils';

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

const PaymentGateBanner = styled.div`
  padding: 16px 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;

  &.paid {
    background-color: #dcfce7;
    color: #15803d;
    border: 1px solid #bbf7d0;
  }

  &.pending {
    background-color: #fef3c7;
    color: #b45309;
    border: 1px solid #fde68a;
  }

  svg {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }
`;

const Consultations = () => {
  const { servicesState, createInvoice, invoicesState, patients } = useBilling();

  const consultationService = useMemo(() => {
    return (servicesState.items || []).find((service) => service.serviceName === 'Orthopedic Consultation');
  }, [servicesState.items]);

  // Check if there is a paid consultation invoice for the first patient
  const hasPaidConsultation = useMemo(() => {
    const consultationInvoices = (invoicesState.items || []).filter(
      (invoice) => invoice.serviceName === 'Orthopedic Consultation' && invoice.status === 'Paid'
    );
    return consultationInvoices.length > 0;
  }, [invoicesState.items]);

  const paymentStatus = useMemo(() => {
    const consultationInvoices = (invoicesState.items || []).filter(
      (invoice) => invoice.serviceName === 'Orthopedic Consultation'
    );
    if (consultationInvoices.length === 0) return 'Not Invoiced';
    const latest = consultationInvoices[0];
    return latest.status; // 'Pending', 'Paid', 'Cancelled'
  }, [invoicesState.items]);


  const patient = patients[0];

  const handleCompleteConsultation = async () => {
    if (!consultationService || !patient) return;
    await createInvoice({
      patientId: patient.id,
      patientName: patient.name,
      department: consultationService.department,
      serviceId: consultationService.id,
      serviceName: consultationService.serviceName,
      price: consultationService.price,
    });
    toast.success('Billing record created successfully');
  };

  return (
    <PageContainer>
      <Header>
        <h1>Medical Consultations</h1>
        <p>Manage patient medical consultations</p>
      </Header>

      <Card size="large">
        <CardHeader>
          <h3>Consultation List</h3>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Payment Gate Banner */}
            {paymentStatus === 'Paid' ? (
              <PaymentGateBanner className="paid">
                <CheckCircleIcon />
                <div>
                  <strong>Payment Confirmed</strong> - Patient has paid the consultation fee. You may proceed with the consultation.
                </div>
              </PaymentGateBanner>
            ) : paymentStatus === 'Pending' ? (
              <PaymentGateBanner className="pending">
                <ExclamationCircleIcon />
                <div>
                  <strong>Payment Pending</strong> - Patient must pay the consultation fee before the session can start. Please direct the patient to the reception desk.
                </div>
              </PaymentGateBanner>
            ) : (
              <PaymentGateBanner className="pending">
                <ExclamationCircleIcon />
                <div>
                  <strong>No Invoice Yet</strong> - An invoice must be generated and paid before the consultation can begin. The nurse/receptionist will handle billing.
                </div>
              </PaymentGateBanner>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Consultation Pricing</h3>
                <p style={{ margin: '6px 0 0 0', color: '#6b7280' }}>Dynamic prices based on service catalog.</p>
                <p style={{ margin: '12px 0 0 0', fontWeight: 600 }}>
                  {consultationService ? formatCurrency(consultationService.price) : 'Service price not set'}
                </p>
              </div>
              <Button
                onClick={handleCompleteConsultation}
                variant="primary"
                disabled={!hasPaidConsultation}
              >
                Complete Consultation
              </Button>
            </div>

            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <ClipboardDocumentIcon style={{ width: '60px', height: '60px', margin: '0 auto 16px', color: '#d1d5db' }} />
              <h3 style={{ margin: '0 0 8px 0' }}>No consultations listed</h3>
              <p>You can start a new consultation from patient appointments</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </PageContainer>
  );
};

export default Consultations;
