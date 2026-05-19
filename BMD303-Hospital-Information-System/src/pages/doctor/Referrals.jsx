import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import ReferralModal from '../../components/medical/ReferralModal';
import { PlusIcon, CalendarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import referralService from '../../api/referralService';
import { useAuth } from '../../context/AuthContext';
import { getStatusColor, getStatusText } from '../../utils/statusUtils';

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

const ReferralsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  thead {
    background-color: #f3f4f6;
    border-bottom: 2px solid #e5e7eb;
  }
  
  th {
    padding: 12px 16px;
    text-align: left;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
  }
  
  tbody tr {
    border-bottom: 1px solid #e5e7eb;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #f9fafb;
    }
  }
  
  td {
    padding: 16px;
    font-size: 14px;
    color: #111827;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => props.$bgColor || '#e5e7eb'};
  color: ${props => props.$color || '#374151'};
`;

const UrgencyBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => {
    if (props.$urgency === 'emergency') return '#fee2e2';
    if (props.$urgency === 'urgent') return '#fef3c7';
    return '#dbeafe';
  }};
  color: ${props => {
    if (props.$urgency === 'emergency') return '#dc2626';
    if (props.$urgency === 'urgent') return '#b45309';
    return '#1d4ed8';
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 32px;
  color: #6b7280;
  
  h3 {
    margin: 16px 0 8px 0;
    font-size: 20px;
    font-weight: 700;
  }
  
  p {
    margin: 0 0 24px 0;
    font-size: 14px;
  }
`;

const LoadingContainer = styled.div`
  padding: 60px 32px;
  text-align: center;
  color: #6b7280;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return 'N/A';
  }
};

const Referrals = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const doctorId = user?.doctorId || user?.id || 1;
      const data = await referralService.getDoctorReferrals(doctorId);
      setReferrals(Array.isArray(data) ? data : (data?.referrals || data?.data || []));
    } catch (error) {
      console.error('Error loading referrals:', error);
      toast.error('Failed to load referrals');
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReferralSuccess = () => {
    loadReferrals();
  };

  if (loading) {
    return (
      <PageContainer>
        <Header>
          <div>
            <h1>Medical Referrals</h1>
            <p>Manage patient referrals to other departments</p>
          </div>
        </Header>
        <LoadingContainer>Loading referrals...</LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <div>
          <h1>Medical Referrals</h1>
          <p>Manage patient referrals to other departments</p>
        </div>
        <HeaderActions>
          <Button 
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <PlusIcon style={{ width: '18px', height: '18px' }} />
            Add Referral
          </Button>
        </HeaderActions>
      </Header>

      <Card size="large">
        <CardHeader>
          <h3>Referral List ({referrals.length})</h3>
        </CardHeader>
        <CardBody>
          {referrals.length === 0 ? (
            <EmptyState>
              🏥
              <h3>No referrals yet</h3>
              <p>Create a new medical referral to get started</p>
              <Button 
                variant="primary"
                onClick={() => setIsModalOpen(true)}
              >
                Create New Referral
              </Button>
            </EmptyState>
          ) : (
            <ReferralsTable>
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Referral Type</th>
                  <th>Reason</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Created Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral) => (
                  <tr key={referral.id || referral.referralId}>
                    <td>
                      <span style={{ fontWeight: '600' }}>
                        {referral.patientId || 'N/A'}
                      </span>
                    </td>
                    <td>{referral.referralType || 'N/A'}</td>
                    <td>{referral.reason || 'N/A'}</td>
                    <td>
                      <UrgencyBadge $urgency={referral.urgency || 'routine'}>
                        {(referral.urgency || 'routine').charAt(0).toUpperCase() + (referral.urgency || 'routine').slice(1)}
                      </UrgencyBadge>
                    </td>
                    <td>
                      <StatusBadge 
                        $bgColor={getStatusColor(referral.status || 'pending')}
                        $color={getStatusColor(referral.status || 'pending', true)}
                      >
                        {getStatusText(referral.status || 'pending')}
                      </StatusBadge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CalendarIcon style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                        {formatDate(referral.createdAt || referral.createdDate)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </ReferralsTable>
          )}
        </CardBody>
      </Card>

      <ReferralModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleReferralSuccess}
      />
    </PageContainer>
  );
};

export default Referrals;
