import styled from 'styled-components';
import ReferralStaffWorkQueue from '../../components/referrals/ReferralStaffWorkQueue';

const PageContainer = styled.div`
  padding: 32px;
  background-color: #f9fafb;
  min-height: 100vh;
`;

const PhysioStaffDashboard = () => (
  <PageContainer>
    <ReferralStaffWorkQueue
      department="Physiotherapy"
      title="Physiotherapy — Staff Dashboard"
      description="Book appointments for pending referrals, then complete visits after the session."
    />
  </PageContainer>
);

export default PhysioStaffDashboard;
