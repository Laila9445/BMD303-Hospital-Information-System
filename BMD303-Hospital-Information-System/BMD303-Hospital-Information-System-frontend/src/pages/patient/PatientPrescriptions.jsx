import { useState, useEffect } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import HomeButton from '../../components/common/HomeButton';
import { BeakerIcon, DocumentTextIcon, CalendarIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import mockDatabase from '../../api/mockDatabase';

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

const PrescriptionsGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const PrescriptionCard = styled(Card)`
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const PrescriptionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
`;

const DoctorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DoctorAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 24px;
    height: 24px;
    color: white;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => {
    switch(props.status) {
      case 'Active': return '#dcfce7';
      case 'Completed': return '#e5e7eb';
      case 'Expired': return '#fef3c7';
      default: return '#eff6ff';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'Active': return '#15803d';
      case 'Completed': return '#374151';
      case 'Expired': return '#92400e';
      default: return '#1d4ed8';
    }
  }};
`;

const InfoSection = styled.div`
  margin-bottom: 16px;
`;

const InfoLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  margin-bottom: 6px;
`;

const InfoValue = styled.p`
  font-size: 14px;
  color: #111827;
  margin: 0;
  line-height: 1.6;
`;

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      if (!currentUser) {
        toast.error('User not found. Please login again.');
        return;
      }

      // Get prescriptions from mock database
      const allPrescriptions = mockDatabase.prescriptions.findAll({ patientId: currentUser.userId });
      
      console.log('Loaded prescriptions:', allPrescriptions);
      
      setPrescriptions(allPrescriptions);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'Scheduled': 'Active',
      'Active': 'Active',
      'Completed': 'Completed',
      'Cancelled': 'Expired',
      'Expired': 'Expired'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString();
  };

  return (
    <PageContainer>
      <HomeButton />
      <Header>
        <h1>My Prescriptions</h1>
        <p>View all medications prescribed by your doctor</p>
      </Header>

      <Card size="large">
        <CardBody>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              Loading prescriptions...
            </div>
          ) : prescriptions.length > 0 ? (
            <PrescriptionsGrid>
              {prescriptions.map((prescription) => (
                <PrescriptionCard key={prescription.prescriptionId}>
                  <CardBody>
                    <PrescriptionHeader>
                      <DoctorInfo>
                        <DoctorAvatar>
                          <UserCircleIcon />
                        </DoctorAvatar>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                            Dr. {prescription.doctorName || 'Ahmed Al-Najjar'}
                          </h3>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                            Prescribed on {formatDate(prescription.prescriptionDate)}
                          </p>
                        </div>
                      </DoctorInfo>
                      <StatusBadge status={getStatusDisplay(prescription.status)}>
                        {getStatusDisplay(prescription.status)}
                      </StatusBadge>
                    </PrescriptionHeader>

                    <div style={{ marginBottom: '16px' }}>
                      <InfoLabel>Medication</InfoLabel>
                      <InfoValue style={{ fontSize: '18px', fontWeight: 600, color: '#2563eb' }}>
                        💊 {prescription.medicationName}
                      </InfoValue>
                    </div>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '16px',
                      marginBottom: '16px'
                    }}>
                      <div>
                        <InfoLabel>Dosage</InfoLabel>
                        <InfoValue>{prescription.dosage}</InfoValue>
                      </div>
                      
                      <div>
                        <InfoLabel>Frequency</InfoLabel>
                        <InfoValue>{prescription.frequency}</InfoValue>
                      </div>
                    </div>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '16px',
                      marginBottom: '16px'
                    }}>
                      <div>
                        <InfoLabel>Duration</InfoLabel>
                        <InfoValue>
                          <CalendarIcon style={{ width: '16px', height: '16px', marginRight: '4px', verticalAlign: 'middle' }} />
                          {prescription.duration} days
                        </InfoValue>
                      </div>
                      
                      <div>
                        <InfoLabel>Quantity</InfoLabel>
                        <InfoValue>{prescription.quantity}</InfoValue>
                      </div>
                    </div>

                    {prescription.instructions && (
                      <div style={{ 
                        padding: '12px', 
                        backgroundColor: '#f9fafb', 
                        borderRadius: '6px',
                        marginBottom: '16px'
                      }}>
                        <InfoLabel style={{ marginBottom: '8px' }}>Instructions</InfoLabel>
                        <InfoValue style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: '8px' 
                        }}>
                          <DocumentTextIcon style={{ width: '18px', height: '18px', color: '#6b7280', flexShrink: 0 }} />
                          {prescription.instructions}
                        </InfoValue>
                      </div>
                    )}

                    {prescription.notes && (
                      <div style={{ 
                        padding: '12px', 
                        backgroundColor: '#fffbeb', 
                        borderRadius: '6px'
                      }}>
                        <InfoLabel style={{ marginBottom: '8px' }}>Doctor's Notes</InfoLabel>
                        <InfoValue style={{ color: '#92400e' }}>
                          {prescription.notes}
                        </InfoValue>
                      </div>
                    )}
                  </CardBody>
                </PrescriptionCard>
              ))}
            </PrescriptionsGrid>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <BeakerIcon style={{ width: '64px', height: '64px', color: '#d1d5db', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No Prescriptions Yet</h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Your doctor hasn't prescribed any medications yet.
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </PageContainer>
  );
};

export default PatientPrescriptions;
