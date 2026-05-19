import styled from 'styled-components';
import ReferralStaffWorkQueue from '../../components/referrals/ReferralStaffWorkQueue';

const PageContainer = styled.div`
  padding: 32px;
  background-color: #f9fafb;
  min-height: 100vh;
`;

const RadiologyStaffDashboard = () => (
  <PageContainer>
    <ReferralStaffWorkQueue
      department="Radiology"
      title="Radiology — Staff Dashboard"
      description="Accept imaging referrals, schedule studies, and complete reports."
    />
  </PageContainer>
);

export default RadiologyStaffDashboard;
