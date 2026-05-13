import styled from 'styled-components';
import { useReferrals } from '../../context/ReferralContext';
import Card from '../../components/common/Card';

const PageContainer = styled.div`
  padding: 32px;
  background-color: #f9fafb;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 24px;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 15px;
    color: #374151;
    margin: 0;
    line-height: 1.5;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled(Card)`
  padding: 20px !important;
`;

const StatLabel = styled.p`
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
`;

const TableCard = styled(Card)`
  padding: 0 !important;
  overflow: hidden;
`;

const TableTitle = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #111827;
  }
`;

const TableWrap = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 14px 24px;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const Td = styled.td`
  padding: 16px 24px;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${({ $status }) =>
    $status === 'Pending' ? '#fef3c7' : $status === 'Accepted' ? '#dbeafe' : '#d1fae5'};
  color: ${({ $status }) =>
    $status === 'Pending' ? '#92400e' : $status === 'Accepted' ? '#1e40af' : '#065f46'};
`;

const EmptyState = styled.div`
  padding: 48px 24px;
  text-align: center;
  color: #374151;
  font-size: 15px;
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px dashed #e5e7eb;
`;

const RadiologyDashboard = () => {
  const { referrals } = useReferrals();

  const radiologyReferrals = referrals.filter((r) => r.type === 'Radiology');
  const pendingCount = radiologyReferrals.filter((r) => r.status === 'Pending').length;
  const acceptedCount = radiologyReferrals.filter((r) => r.status === 'Accepted').length;
  const completedCount = radiologyReferrals.filter((r) => r.status === 'Completed').length;

  return (
    <PageContainer>
      <Header>
        <h1>Radiology Dashboard</h1>
        <p>Review and manage radiology referrals sent from the clinic.</p>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatLabel>Pending Referrals</StatLabel>
          <StatValue>{pendingCount}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Accepted</StatLabel>
          <StatValue>{acceptedCount}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Completed</StatLabel>
          <StatValue>{completedCount}</StatValue>
        </StatCard>
      </StatsGrid>

      {radiologyReferrals.length === 0 ? (
        <EmptyState>No radiology referrals yet. New referrals will appear here when doctors create them.</EmptyState>
      ) : (
        <TableCard>
          <TableTitle>
            <h2>Referrals</h2>
          </TableTitle>
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>Patient</Th>
                  <Th>Diagnosis</Th>
                  <Th>Notes</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {radiologyReferrals.map((referral) => (
                  <tr key={referral.id}>
                    <Td>{referral.patientName || '—'}</Td>
                    <Td>{referral.diagnosis || '—'}</Td>
                    <Td>{referral.notes || '—'}</Td>
                    <Td>
                      <StatusBadge $status={referral.status}>{referral.status}</StatusBadge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        </TableCard>
      )}
    </PageContainer>
  );
};

export default RadiologyDashboard;
