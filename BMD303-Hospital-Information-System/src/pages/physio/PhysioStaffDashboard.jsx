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
      description="Accept referrals, then book sessions using your physiotherapy schedule."
    />
  </PageContainer>
);

export default PhysioStaffDashboard;
